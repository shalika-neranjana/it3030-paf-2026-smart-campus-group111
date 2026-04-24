package com.unireserver.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    private String id;
    
    private String filename;
    
    private String originalFilename;
    
    private String fileType;
    
    private long fileSize;
    
    private String storagePath;
    
    private Instant uploadedAt;
    
    private String uploadedBy;
}
