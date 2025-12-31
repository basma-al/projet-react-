package com.shopie.backend.dto;

import com.shopie.backend.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private BigDecimal total;
    private LocalDateTime date;
    private Order.Statut statut;
    private List<OrderItemResponse> orderItems;
    private PaymentResponse payment;
    
    // Constructeur pour créer depuis une entité Order
    public OrderResponse(Order order) {
        this.id = order.getId();
        this.total = order.getTotal();
        this.date = order.getDate();
        this.statut = order.getStatut();
        // Les orderItems et payment seront ajoutés séparément si nécessaire
    }
}