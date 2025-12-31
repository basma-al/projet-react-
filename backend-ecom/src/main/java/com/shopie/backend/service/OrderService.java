package com.shopie.backend.service;

import com.shopie.backend.exception.BadRequestException;
import com.shopie.backend.exception.ResourceNotFoundException;
import com.shopie.backend.model.*;
import com.shopie.backend.repository.OrderItemRepository;
import com.shopie.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private ProductService productService;
    
    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserOrderByDateDesc(user);
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAllOrderByDateDesc();
    }
    
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée avec l'ID: " + id));
    }
    
    @Transactional
    public Order createOrderFromCart(User user) {
        List<CartItem> cartItems = cartService.getCartItems(user);
        
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Le panier est vide");
        }
        
        // Vérifier le stock pour tous les articles
        for (CartItem cartItem : cartItems) {
            if (cartItem.getProduct().getStock() < cartItem.getQuantite()) {
                throw new BadRequestException("Stock insuffisant pour le produit: " + cartItem.getProduct().getNom());
            }
        }
        
        // Calculer le total d'abord
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal itemTotal = cartItem.getProduct().getPrix().multiply(BigDecimal.valueOf(cartItem.getQuantite()));
            total = total.add(itemTotal);
        }
        
        // Créer la commande avec le total calculé
        Order order = new Order();
        order.setUser(user);
        order.setStatut(Order.Statut.PENDING);
        order.setTotal(total);
        order.setDate(LocalDateTime.now());
        
        // Sauvegarder la commande
        order = orderRepository.save(order);
        
        // Créer les OrderItems
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantite(cartItem.getQuantite());
            orderItem.setPrix(cartItem.getProduct().getPrix());
            
            orderItemRepository.save(orderItem);
            
            // Mettre à jour le stock
            Product product = cartItem.getProduct();
            int newStock = product.getStock() - cartItem.getQuantite();
            productService.updateStock(product.getId(), newStock);
        }
        
        // Vider le panier
        cartService.clearCart(user);
        
        return order;
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.Statut newStatus) {
        Order order = getOrderById(orderId);
        order.setStatut(newStatus);
        return orderRepository.save(order);
    }
    
    public List<Order> getOrdersByStatus(Order.Statut statut) {
        return orderRepository.findByStatut(statut);
    }
}