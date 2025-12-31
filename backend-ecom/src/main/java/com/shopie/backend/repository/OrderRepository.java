package com.shopie.backend.repository;

import com.shopie.backend.model.Order;
import com.shopie.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByDateDesc(User user);
    List<Order> findByStatut(Order.Statut statut);
    
    @Query("SELECT o FROM Order o ORDER BY o.date DESC")
    List<Order> findAllOrderByDateDesc();
}