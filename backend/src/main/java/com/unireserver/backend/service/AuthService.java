package com.unireserver.backend.service;

import com.unireserver.backend.dto.AuthResponse;
import com.unireserver.backend.dto.LoginRequest;
import com.unireserver.backend.dto.RegisterRequest;
import com.unireserver.backend.dto.UpdateProfileRequest;
import com.unireserver.backend.dto.UserProfileResponse;
import com.unireserver.backend.model.AppUser;
import com.unireserver.backend.model.Message;
import com.unireserver.backend.repository.UserRepository;
import com.unireserver.backend.util.PhoneNumberUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.unireserver.backend.dto.GoogleLoginRequest;
import com.unireserver.backend.model.UserRole;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;

import java.time.Instant;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final ImageStorageService imageStorageService;
    private final MessageService messageService;

    private static final Pattern STRONG_PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");
    private static final String PASSWORD_VALIDATION_MESSAGE =
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    public AuthResponse register(RegisterRequest request) {
        validateStrongPassword(request.getPassword());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        String normalizedPhone = PhoneNumberUtil.normalizeSriLankanPhone(request.getPhoneNumber());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new IllegalArgumentException("Phone number is already in use");
        }

        String imageFilename = imageStorageService.storeProfileImage(request.getImage(), email);

        AppUser user = AppUser.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .phoneNumber(normalizedPhone)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .imageFilename(imageFilename)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        AppUser savedUser = userRepository.save(user);
        sendWelcomeMessage(savedUser);
        String token = jwtService.generateToken(savedUser);
        return mapAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        validateStrongPassword(request.getPassword());

        String email = request.getEmail().trim().toLowerCase();
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return mapAuthResponse(user, token);
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail().toLowerCase();
            String googleId = payload.getSubject();
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");
            String pictureUrl = (String) payload.get("picture");

            AppUser user = userRepository.findByEmail(email)
                    .map(existingUser -> {
                        existingUser.setGoogleId(googleId);
                        return userRepository.save(existingUser);
                    })
                    .orElseGet(() -> {
                        AppUser newUser = AppUser.builder()
                                .email(email)
                                .googleId(googleId)
                                .firstName(firstName != null ? firstName : "User")
                                .lastName(lastName != null ? lastName : "")
                                .role(UserRole.STUDENT)
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .build();
                        AppUser savedNewUser = userRepository.save(newUser);
                        sendWelcomeMessage(savedNewUser);
                        return savedNewUser;
                    });

            String token = jwtService.generateToken(user);
            return mapAuthResponse(user, token);

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google token: " + e.getMessage());
        }
    }

    public UserProfileResponse me(String email) {
        AppUser user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(PhoneNumberUtil.formatSriLankanPhone(user.getPhoneNumber()))
                .role(user.getRole())
                .imageUrl(imageStorageService.toPublicUrl(user.getImageFilename()))
                .build();
    }

    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        AppUser user = userRepository.findByEmail(currentEmail.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String newEmail = request.getEmail().trim().toLowerCase();
        String normalizedPhone = PhoneNumberUtil.normalizeSriLankanPhone(request.getPhoneNumber());

        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (!user.getPhoneNumber().equals(normalizedPhone) && userRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new IllegalArgumentException("Phone number is already in use");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(newEmail);
        user.setPhoneNumber(normalizedPhone);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            validateStrongPassword(request.getPassword());
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Password and confirm password do not match");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageFilename = imageStorageService.storeProfileImage(request.getImage(), newEmail);
            user.setImageFilename(imageFilename);
        }

        user.setUpdatedAt(Instant.now());
        AppUser savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);
        return mapAuthResponse(savedUser, token);
    }

    public void deleteProfile(String email) {
        AppUser user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        userRepository.delete(user);
    }

    private AuthResponse mapAuthResponse(AppUser user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(PhoneNumberUtil.formatSriLankanPhone(user.getPhoneNumber()))
                .role(user.getRole())
                .imageUrl(imageStorageService.toPublicUrl(user.getImageFilename()))
                .build();
    }

    private void validateStrongPassword(String password) {
        if (password == null || !STRONG_PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(PASSWORD_VALIDATION_MESSAGE);
        }
    }

    private void sendWelcomeMessage(AppUser user) {
        Message welcomeMessage = Message.builder()
                .senderId("SYSTEM")
                .receiverId(user.getId())
                .title("Welcome to UniReserver")
                .body("Hi " + user.getFirstName() + ", welcome to UniReserver. Your account is ready to use.")
                .build();
        messageService.createMessage(welcomeMessage);
    }
}
