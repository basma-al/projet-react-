package com.shopie.backend.dto;

import com.shopie.backend.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private BigDecimal montant;
    private String methode;
    private LocalDateTime date;
    private Payment.Statut statut;
    
    // Constructeur pour créer depuis une entité Payment
    public PaymentResponse(Payment payment) {
        this.id = payment.getId();
        this.montant = payment.getMontant();
        this.methode = payment.getMethode();
        this.date = payment.getDate();
        this.statut = payment.getStatut();
    }
}