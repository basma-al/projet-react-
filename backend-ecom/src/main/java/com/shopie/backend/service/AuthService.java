package com.shopie.backend.service;

import com.shopie.backend.dto.AuthRequest;
import com.shopie.backend.dto.AuthResponse;
import com.shopie.backend.dto.RegisterRequest;
import com.shopie.backend.exception.BadRequestException;
import com.shopie.backend.model.User;
import com.shopie.backend.repository.UserRepository;
import com.shopie.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    public AuthResponse authenticateUser(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getMotDePasse()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken((UserDetails) authentication.getPrincipal());
        
        User user = (User) authentication.getPrincipal();
        
        return new AuthResponse(jwt, user.getId(), user.getNom(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Erreur: L'email est déjà utilisé!");
        }
        
        // Créer un nouveau compte utilisateur
        User user = new User();
        user.setNom(signUpRequest.getNom());
        user.setEmail(signUpRequest.getEmail());
        user.setMotDePasse(encoder.encode(signUpRequest.getMotDePasse()));
        user.setRole(User.Role.USER);
        
        userRepository.save(user);
        
        // Authentifier automatiquement l'utilisateur après inscription
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getEmail(), signUpRequest.getMotDePasse()));
        
        String jwt = jwtUtils.generateJwtToken((UserDetails) authentication.getPrincipal());
        
        return new AuthResponse(jwt, user.getId(), user.getNom(), user.getEmail(), user.getRole().name());
    }
}