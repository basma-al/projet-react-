package com.shopie.backend.controller;

import com.shopie.backend.dto.UserResponse;
import com.shopie.backend.dto.UserUpdateRequest;
import com.shopie.backend.model.User;
import com.shopie.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/admin/users")
@Tag(name = "User Management", description = "API de gestion des utilisateurs (Admin uniquement)")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs", description = "Récupère la liste paginée de tous les utilisateurs")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserResponse> users = userService.getAllUsers(pageable, search);
        
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur", description = "Récupère les détails d'un utilisateur par son ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur", description = "Modifie les informations d'un utilisateur")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Changer le rôle d'un utilisateur", description = "Change le rôle d'un utilisateur (USER/ADMIN)")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role) {
        UserResponse updatedUser = userService.changeUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Activer/Désactiver un utilisateur", description = "Active ou désactive un compte utilisateur")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        UserResponse updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime définitivement un utilisateur")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Utilisateur supprimé avec succès");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Statistiques des utilisateurs", description = "Récupère les statistiques des utilisateurs")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }
}