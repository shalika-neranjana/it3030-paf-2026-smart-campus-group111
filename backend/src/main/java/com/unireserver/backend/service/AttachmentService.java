package com.unireserver.backend.service;

import com.unireserver.backend.model.Attachment;
import com.unireserver.backend.model.Ticket;
import com.unireserver.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final TicketRepository ticketRepository;

    @Value("${app.upload.dir-tickets:uploads/tickets}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = new HashSet<>(Arrays.asList("image/jpeg", "image/png", "image/jpg"));
    private static final int MAX_ATTACHMENTS = 3;

    public Attachment uploadAttachment(String ticketId, MultipartFile file, String userId, String userName) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Validate attachment count
        if (ticket.getAttachments().size() >= MAX_ATTACHMENTS) {
            throw new RuntimeException("Maximum of " + MAX_ATTACHMENTS + " attachments allowed per ticket");
        }

        // Validate file
        validateFile(file);

        // Create unique filename
        String filename = UUID.randomUUID() + "_" + System.currentTimeMillis() + getFileExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(uploadDir, ticketId);

        // Create directories if they don't exist
        Files.createDirectories(uploadPath);

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        // Create attachment record
        Attachment attachment = Attachment.builder()
                .id(UUID.randomUUID().toString())
                .filename(filename)
                .originalFilename(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(filePath.toString())
                .uploadedAt(Instant.now())
                .uploadedBy(userId)
                .build();

        ticket.getAttachments().add(attachment);
        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);

        log.info("Attachment uploaded: {} for ticket: {}", filename, ticketId);
        return attachment;
    }

    public void deleteAttachment(String ticketId, String attachmentId, String userId) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Attachment attachment = ticket.getAttachments().stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // Delete file from filesystem
        Path filePath = Paths.get(attachment.getStoragePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Remove from ticket
        ticket.getAttachments().remove(attachment);
        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);

        log.info("Attachment deleted: {} from ticket: {}", attachmentId, ticketId);
    }

    public byte[] downloadAttachment(String ticketId, String attachmentId) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Attachment attachment = ticket.getAttachments().stream()
                .filter(a -> a.getId().equals(attachmentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Path filePath = Paths.get(attachment.getStoragePath());
        return Files.readAllBytes(filePath);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed size of 5MB");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new RuntimeException("Only JPG and PNG images are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return ".bin";
    }
}
