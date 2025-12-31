package com.shopie.backend.repository;

import com.shopie.backend.model.Order;
import com.shopie.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrder(Order order);
    List<Payment> findByStatut(Payment.Statut statut);
    
    @Query("SELECT p FROM Payment p ORDER BY p.date DESC")
    List<Payment> findAllOrderByDateDesc();
}