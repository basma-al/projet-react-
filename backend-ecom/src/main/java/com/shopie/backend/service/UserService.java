package com.shopie.backend.service;

import com.shopie.backend.dto.UserResponse;
import com.shopie.backend.dto.UserUpdateRequest;
import com.shopie.backend.model.User;
import com.shopie.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Page<UserResponse> getAllUsers(Pageable pageable, String search) {
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(
                search.trim(), search.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return users.map(this::convertToUserResponse);
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));
        return convertToUserResponse(user);
    }

    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé par un autre utilisateur");
            }
        }

        user.setNom(request.getNom());
        user.setEmail(request.getEmail());

        // Changer le mot de passe si fourni
        if (request.getNouveauMotDePasse() != null && !request.getNouveauMotDePasse().trim().isEmpty()) {
            user.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        }

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    public UserResponse changeUserRole(Long id, User.Role role) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        // Empêcher la promotion vers ADMIN - seul l'admin existant peut rester admin
        if (role == User.Role.ADMIN) {
            throw new RuntimeException("Impossible de promouvoir un utilisateur au rôle d'administrateur. Il ne peut y avoir qu'un seul administrateur.");
        }

        // Empêcher la rétrogradation de l'admin unique
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Impossible de rétrograder l'administrateur unique. Il doit toujours y avoir un administrateur.");
        }

        user.setRole(role);
        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    public UserResponse toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        // Pour l'instant, on utilise un champ enabled fictif
        // Dans une vraie application, il faudrait ajouter ce champ à l'entité User
        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        // Empêcher la suppression de l'administrateur unique
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Impossible de supprimer l'administrateur unique. Il doit toujours y avoir un administrateur.");
        }

        userRepository.delete(user);
    }

    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long adminCount = userRepository.countByRole(User.Role.ADMIN);
        long userCount = userRepository.countByRole(User.Role.USER);
        
        stats.put("totalUsers", totalUsers);
        stats.put("adminCount", adminCount);
        stats.put("userCount", userCount);
        
        return stats;
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse(user);
        
        // Calculer les statistiques de l'utilisateur
        if (user.getOrders() != null) {
            response.setTotalOrders(user.getOrders().size());
            response.setTotalSpent(
                user.getOrders().stream()
                    .mapToDouble(order -> order.getTotal().doubleValue())
                    .sum()
            );
        }
        
        return response;
    }
}