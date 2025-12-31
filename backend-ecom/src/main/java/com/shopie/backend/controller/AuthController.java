package com.shopie.backend.controller;

import com.shopie.backend.dto.AuthRequest;
import com.shopie.backend.dto.AuthResponse;
import com.shopie.backend.dto.RegisterRequest;
import com.shopie.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "API d'authentification")
public class AuthController {
    
    @Autowired
    AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur", description = "Authentifie un utilisateur et retourne un token JWT")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    @Operation(summary = "Inscription utilisateur", description = "Crée un nouveau compte utilisateur")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        AuthResponse response = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(response);
    }
}