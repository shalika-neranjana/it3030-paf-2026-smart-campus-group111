package com.unireserver.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ImageStorageService {

    private final Path uploadDirectory;

    public ImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeProfileImage(MultipartFile image, String email) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Profile image is required");
        }
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to initialize upload directory", e);
        }

        String extension = resolveExtension(image.getOriginalFilename());
        String filename = email.toLowerCase() + extension;

        Path destination = uploadDirectory.resolve(filename).normalize();
        if (!destination.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid image filename");
        }

        try {
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to save profile image", e);
        }

        return filename;
    }

    public String storeImage(MultipartFile image, String prefix) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image is required");
        }
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to initialize upload directory", e);
        }

        String extension = resolveExtension(image.getOriginalFilename());
        String filename = prefix + "_" + System.currentTimeMillis() + extension;

        Path destination = uploadDirectory.resolve(filename).normalize();
        if (!destination.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid image filename");
        }

        try {
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to save image", e);
        }

        return filename;
    }

    public String toPublicUrl(String filename) {
        return "/uploads/" + filename;
    }

    private String resolveExtension(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            return ".png";
        }
        String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
        if (ext.matches("\\.(jpg|jpeg|png|webp)$")) {
            return ext;
        }
        return ".png";
    }
}
