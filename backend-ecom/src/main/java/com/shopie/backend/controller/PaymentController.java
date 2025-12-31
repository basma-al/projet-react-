package com.shopie.backend.controller;

import com.shopie.backend.dto.PaymentRequest;
import com.shopie.backend.model.Payment;
import com.shopie.backend.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/payments")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payments", description = "API de gestion des paiements")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping
    @Operation(summary = "Créer un paiement", description = "Crée un nouveau paiement pour une commande")
    public ResponseEntity<Payment> createPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.createPayment(request);
        return ResponseEntity.ok(payment);
    }
    
    @PostMapping("/{id}/process")
    @Operation(summary = "Traiter un paiement", description = "Traite un paiement en attente")
    public ResponseEntity<Payment> processPayment(@PathVariable Long id) {
        Payment payment = paymentService.processPayment(id);
        return ResponseEntity.ok(payment);
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tous les paiements", description = "Récupère tous les paiements (Admin uniquement)")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Détails d'un paiement", description = "Récupère les détails d'un paiement (Admin uniquement)")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }
    
    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier le statut", description = "Modifie le statut d'un paiement (Admin uniquement)")
    public ResponseEntity<Payment> updatePaymentStatus(@PathVariable Long id, @RequestParam Payment.Statut statut) {
        Payment payment = paymentService.updatePaymentStatus(id, statut);
        return ResponseEntity.ok(payment);
    }
    
    @GetMapping("/admin/status/{statut}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Paiements par statut", description = "Récupère les paiements par statut (Admin uniquement)")
    public ResponseEntity<List<Payment>> getPaymentsByStatus(@PathVariable Payment.Statut statut) {
        List<Payment> payments = paymentService.getPaymentsByStatus(statut);
        return ResponseEntity.ok(payments);
    }
}