package com.shopie.backend.repository;

import com.shopie.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Méthodes pour la recherche
    Page<User> findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String nom, String email, Pageable pageable);
    
    // Méthodes pour les statistiques
    long countByRole(User.Role role);
}