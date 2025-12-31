package com.shopie.backend.service;

import com.shopie.backend.dto.CartItemRequest;
import com.shopie.backend.exception.BadRequestException;
import com.shopie.backend.exception.ResourceNotFoundException;
import com.shopie.backend.model.CartItem;
import com.shopie.backend.model.Product;
import com.shopie.backend.model.User;
import com.shopie.backend.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductService productService;
    
    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }
    
    @Transactional
    public CartItem addToCart(User user, CartItemRequest request) {
        Product product = productService.getProductById(request.getProductId());
        
        if (product.getStock() < request.getQuantite()) {
            throw new BadRequestException("Stock insuffisant pour ce produit");
        }
        
        Optional<CartItem> existingCartItem = cartItemRepository.findByUserAndProduct(user, product);
        
        if (existingCartItem.isPresent()) {
            CartItem cartItem = existingCartItem.get();
            int newQuantity = cartItem.getQuantite() + request.getQuantite();
            
            if (product.getStock() < newQuantity) {
                throw new BadRequestException("Stock insuffisant pour cette quantité");
            }
            
            cartItem.setQuantite(newQuantity);
            return cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantite(request.getQuantite());
            return cartItemRepository.save(cartItem);
        }
    }
    
    @Transactional
    public CartItem updateCartItem(User user, Long cartItemId, Integer quantite) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Article du panier non trouvé"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Vous n'êtes pas autorisé à modifier cet article");
        }
        
        if (cartItem.getProduct().getStock() < quantite) {
            throw new BadRequestException("Stock insuffisant pour cette quantité");
        }
        
        cartItem.setQuantite(quantite);
        return cartItemRepository.save(cartItem);
    }
    
    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Article du panier non trouvé"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Vous n'êtes pas autorisé à supprimer cet article");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
}