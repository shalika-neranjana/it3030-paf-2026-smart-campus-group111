package com.unireserver.backend.dto;

import com.unireserver.backend.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Pattern(regexp = "^[A-Za-z]+(?:[\\s'-][A-Za-z]+)*$", message = "First name must contain only English letters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[A-Za-z]+(?:[\\s'-][A-Za-z]+)*$", message = "Last name must contain only English letters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotNull(message = "User role is required")
    private UserRole role;

    @NotNull(message = "Profile image is required")
    private MultipartFile image;
}
