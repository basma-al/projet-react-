package com.shopie.backend.controller;

import com.shopie.backend.dto.CartItemRequest;
import com.shopie.backend.model.CartItem;
import com.shopie.backend.model.User;
import com.shopie.backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/cart")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart", description = "API de gestion du panier")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @GetMapping
    @Operation(summary = "Voir le panier", description = "Récupère les articles du panier de l'utilisateur connecté")
    public ResponseEntity<List<CartItem>> getCartItems(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<CartItem> cartItems = cartService.getCartItems(user);
        return ResponseEntity.ok(cartItems);
    }
    
    @PostMapping
    @Operation(summary = "Ajouter au panier", description = "Ajoute un produit au panier")
    public ResponseEntity<CartItem> addToCart(Authentication authentication, @Valid @RequestBody CartItemRequest request) {
        User user = (User) authentication.getPrincipal();
        CartItem cartItem = cartService.addToCart(user, request);
        return ResponseEntity.ok(cartItem);
    }
    
    @PutMapping("/{cartItemId}")
    @Operation(summary = "Modifier la quantité", description = "Modifie la quantité d'un article dans le panier")
    public ResponseEntity<CartItem> updateCartItem(Authentication authentication, 
                                                   @PathVariable Long cartItemId, 
                                                   @RequestParam Integer quantite) {
        User user = (User) authentication.getPrincipal();
        CartItem cartItem = cartService.updateCartItem(user, cartItemId, quantite);
        return ResponseEntity.ok(cartItem);
    }
    
    @DeleteMapping("/{cartItemId}")
    @Operation(summary = "Supprimer du panier", description = "Supprime un article du panier")
    public ResponseEntity<?> removeFromCart(Authentication authentication, @PathVariable Long cartItemId) {
        User user = (User) authentication.getPrincipal();
        cartService.removeFromCart(user, cartItemId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping
    @Operation(summary = "Vider le panier", description = "Supprime tous les articles du panier")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}