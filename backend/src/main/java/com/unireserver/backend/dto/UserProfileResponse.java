package com.unireserver.backend.dto;

import com.unireserver.backend.model.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponse {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private String imageUrl;
}
