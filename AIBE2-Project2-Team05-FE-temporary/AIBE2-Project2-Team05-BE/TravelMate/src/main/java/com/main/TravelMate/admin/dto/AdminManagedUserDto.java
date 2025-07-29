package com.main.TravelMate.admin.dto;

import com.main.TravelMate.admin.entity.Admin;
import com.main.TravelMate.admin.entity.ManagedUser;
import com.main.TravelMate.user.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminManagedUserDto {
    private Long id;
    private User user;
    private Admin admin;
    private String status;
    private String reason;
    private LocalDateTime updatedAt;

    public AdminManagedUserDto(ManagedUser managedUser) {
        this.id = managedUser.getId();
        this.user = managedUser.getUser();
        this.admin = managedUser.getAdmin();
        this.status = managedUser.getStatus();
        this.reason = managedUser.getReason();
        this.updatedAt = managedUser.getUpdatedAt();
    }
} 