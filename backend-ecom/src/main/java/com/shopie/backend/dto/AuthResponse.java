package com.shopie.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String nom;
    private String email;
    private String role;
    
    public AuthResponse(String token, Long id, String nom, String email, String role) {
        this.token = token;
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.role = role;
    }
}