package com.shopie.backend.dto;

import com.shopie.backend.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private String productName;
    private Integer quantite;
    private BigDecimal prix;
    
    // Constructeur pour créer depuis une entité OrderItem
    public OrderItemResponse(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.productName = orderItem.getProduct().getNom();
        this.quantite = orderItem.getQuantite();
        this.prix = orderItem.getPrix();
    }
}