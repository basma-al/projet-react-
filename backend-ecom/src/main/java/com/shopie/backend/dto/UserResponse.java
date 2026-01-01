package com.shopie.backend.dto;

import com.shopie.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nom;
    private String email;
    private User.Role role;
    private boolean enabled;
    private int totalOrders;
    private double totalSpent;
    
    public UserResponse(User user) {
        this.id = user.getId();
        this.nom = user.getNom();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.enabled = user.isEnabled();
        this.totalOrders = 0;
        this.totalSpent = 0.0;
    }
}