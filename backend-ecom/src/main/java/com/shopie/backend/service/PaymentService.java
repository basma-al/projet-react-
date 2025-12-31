package com.shopie.backend.service;

import com.shopie.backend.dto.PaymentRequest;
import com.shopie.backend.exception.BadRequestException;
import com.shopie.backend.exception.ResourceNotFoundException;
import com.shopie.backend.model.Order;
import com.shopie.backend.model.Payment;
import com.shopie.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderService orderService;
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllOrderByDateDesc();
    }
    
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement non trouvé avec l'ID: " + id));
    }
    
    public Payment getPaymentByOrder(Order order) {
        return paymentRepository.findByOrder(order)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun paiement trouvé pour cette commande"));
    }
    
    @Transactional
    public Payment createPayment(PaymentRequest request) {
        Order order = orderService.getOrderById(request.getOrderId());
        
        // Vérifier si un paiement existe déjà pour cette commande
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new BadRequestException("Un paiement existe déjà pour cette commande");
        }
        
        // Vérifier que le montant correspond au total de la commande
        if (request.getMontant().compareTo(order.getTotal()) != 0) {
            throw new BadRequestException("Le montant du paiement ne correspond pas au total de la commande");
        }
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMontant(request.getMontant());
        payment.setMethode(request.getMethode());
        payment.setStatut(Payment.Statut.PENDING);
        
        return paymentRepository.save(payment);
    }
    
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, Payment.Statut newStatus) {
        Payment payment = getPaymentById(paymentId);
        payment.setStatut(newStatus);
        
        // Si le paiement est confirmé, mettre à jour le statut de la commande
        if (newStatus == Payment.Statut.PAID) {
            orderService.updateOrderStatus(payment.getOrder().getId(), Order.Statut.PAID);
        }
        
        return paymentRepository.save(payment);
    }
    
    public List<Payment> getPaymentsByStatus(Payment.Statut statut) {
        return paymentRepository.findByStatut(statut);
    }
    
    @Transactional
    public Payment processPayment(Long paymentId) {
        Payment payment = getPaymentById(paymentId);
        
        if (payment.getStatut() != Payment.Statut.PENDING) {
            throw new BadRequestException("Ce paiement a déjà été traité");
        }
        
        // Ici, vous intégreriez avec un service de paiement réel (Stripe, PayPal, etc.)
        // Pour la démo, nous simulons un paiement réussi
        payment.setStatut(Payment.Statut.PAID);
        orderService.updateOrderStatus(payment.getOrder().getId(), Order.Statut.PAID);
        
        return paymentRepository.save(payment);
    }
}