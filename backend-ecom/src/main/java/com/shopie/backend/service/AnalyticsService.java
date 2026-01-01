package com.shopie.backend.service;

import com.shopie.backend.model.Order;
import com.shopie.backend.model.Product;
import com.shopie.backend.model.User;
import com.shopie.backend.repository.OrderRepository;
import com.shopie.backend.repository.ProductRepository;
import com.shopie.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Statistiques générales
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        // Revenus totaux
        BigDecimal totalRevenue = orderRepository.findAll().stream()
            .filter(order -> order.getStatut() == Order.Statut.DELIVERED)
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Commandes du mois en cours
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);
        
        long ordersThisMonth = orderRepository.countByDateBetween(startOfMonth, endOfMonth);
        
        BigDecimal revenueThisMonth = orderRepository.findByDateBetween(startOfMonth, endOfMonth).stream()
            .filter(order -> order.getStatut() == Order.Statut.DELIVERED)
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Produits en stock faible
        long lowStockProducts = productRepository.findAll().stream()
            .filter(product -> product.getStock() < 10)
            .count();
        
        // Commandes en attente
        long pendingOrders = orderRepository.countByStatut(Order.Statut.PENDING);
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue.doubleValue());
        stats.put("ordersThisMonth", ordersThisMonth);
        stats.put("revenueThisMonth", revenueThisMonth.doubleValue());
        stats.put("lowStockProducts", lowStockProducts);
        stats.put("pendingOrders", pendingOrders);
        
        return stats;
    }

    public Map<String, Object> getSalesStats(LocalDate startDate, LocalDate endDate, String period) {
        Map<String, Object> stats = new HashMap<>();
        
        // Définir les dates par défaut si non fournies
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusMonths(12);
        }
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByDateBetween(start, end);
        List<Order> completedOrders = orders.stream()
            .filter(order -> order.getStatut() == Order.Statut.DELIVERED)
            .collect(Collectors.toList());
        
        // Revenus totaux pour la période
        BigDecimal totalRevenue = completedOrders.stream()
            .map(Order::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Nombre de commandes
        int totalOrders = completedOrders.size();
        
        // Panier moyen
        double averageOrderValue = totalOrders > 0 ? totalRevenue.doubleValue() / totalOrders : 0;
        
        // Évolution par période
        Map<String, Double> revenueByPeriod = getRevenueByPeriod(completedOrders, period);
        
        stats.put("totalRevenue", totalRevenue.doubleValue());
        stats.put("totalOrders", totalOrders);
        stats.put("averageOrderValue", averageOrderValue);
        stats.put("revenueByPeriod", revenueByPeriod);
        stats.put("startDate", startDate.toString());
        stats.put("endDate", endDate.toString());
        
        return stats;
    }

    public Map<String, Object> getProductStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Product> allProducts = productRepository.findAll();
        
        // Produits en stock faible (moins de 10)
        List<Product> lowStockProducts = allProducts.stream()
            .filter(product -> product.getStock() < 10)
            .sorted(Comparator.comparing(Product::getStock))
            .collect(Collectors.toList());
        
        // Produits en rupture de stock
        List<Product> outOfStockProducts = allProducts.stream()
            .filter(product -> product.getStock() == 0)
            .collect(Collectors.toList());
        
        // Valeur totale du stock
        double totalStockValue = allProducts.stream()
            .mapToDouble(product -> product.getPrix().doubleValue() * product.getStock())
            .sum();
        
        stats.put("totalProducts", allProducts.size());
        stats.put("lowStockProducts", lowStockProducts);
        stats.put("outOfStockProducts", outOfStockProducts);
        stats.put("totalStockValue", totalStockValue);
        stats.put("lowStockCount", lowStockProducts.size());
        stats.put("outOfStockCount", outOfStockProducts.size());
        
        return stats;
    }

    public Map<String, Object> getCustomerStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<User> allUsers = userRepository.findAll();
        List<User> customers = allUsers.stream()
            .filter(user -> user.getRole() == User.Role.USER)
            .collect(Collectors.toList());
        
        // Clients avec commandes
        List<User> activeCustomers = customers.stream()
            .filter(user -> user.getOrders() != null && !user.getOrders().isEmpty())
            .collect(Collectors.toList());
        
        // Top clients par nombre de commandes
        List<Map<String, Object>> topCustomersByOrders = activeCustomers.stream()
            .sorted((u1, u2) -> Integer.compare(u2.getOrders().size(), u1.getOrders().size()))
            .limit(10)
            .map(user -> {
                Map<String, Object> customerData = new HashMap<>();
                customerData.put("id", user.getId());
                customerData.put("nom", user.getNom());
                customerData.put("email", user.getEmail());
                customerData.put("totalOrders", user.getOrders().size());
                
                double totalSpent = user.getOrders().stream()
                    .filter(order -> order.getStatut() == Order.Statut.DELIVERED)
                    .mapToDouble(order -> order.getTotal().doubleValue())
                    .sum();
                customerData.put("totalSpent", totalSpent);
                
                return customerData;
            })
            .collect(Collectors.toList());
        
        stats.put("totalCustomers", customers.size());
        stats.put("activeCustomers", activeCustomers.size());
        stats.put("topCustomersByOrders", topCustomersByOrders);
        
        return stats;
    }

    public Map<String, Object> getOrderStats(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Définir les dates par défaut si non fournies
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusMonths(3);
        }
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByDateBetween(start, end);
        
        // Statistiques par statut
        Map<String, Long> ordersByStatus = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getStatut().toString(),
                Collectors.counting()
            ));
        
        // Évolution des commandes par jour
        Map<String, Long> ordersByDay = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getDate().toLocalDate().toString(),
                Collectors.counting()
            ));
        
        stats.put("totalOrders", orders.size());
        stats.put("ordersByStatus", ordersByStatus);
        stats.put("ordersByDay", ordersByDay);
        stats.put("startDate", startDate.toString());
        stats.put("endDate", endDate.toString());
        
        return stats;
    }

    public Map<String, Object> getRevenueChartData(String period, int limit) {
        Map<String, Object> chartData = new HashMap<>();
        
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate;
        
        switch (period.toUpperCase()) {
            case "DAY":
                startDate = endDate.minusDays(limit);
                break;
            case "WEEK":
                startDate = endDate.minusWeeks(limit);
                break;
            case "MONTH":
                startDate = endDate.minusMonths(limit);
                break;
            default:
                startDate = endDate.minusMonths(12);
        }
        
        List<Order> orders = orderRepository.findByDateBetween(startDate, endDate);
        List<Order> completedOrders = orders.stream()
            .filter(order -> order.getStatut() == Order.Statut.DELIVERED)
            .collect(Collectors.toList());
        
        Map<String, Double> revenueData = getRevenueByPeriod(completedOrders, period);
        
        chartData.put("labels", new ArrayList<>(revenueData.keySet()));
        chartData.put("data", new ArrayList<>(revenueData.values()));
        chartData.put("period", period);
        
        return chartData;
    }

    public Map<String, Object> getTopProducts(int limit, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        
        // Pour l'instant, on retourne les produits triés par stock décroissant
        // Dans une vraie application, il faudrait calculer les ventes réelles
        List<Product> topProducts = productRepository.findAll().stream()
            .sorted((p1, p2) -> Integer.compare(p2.getStock(), p1.getStock()))
            .limit(limit)
            .collect(Collectors.toList());
        
        List<Map<String, Object>> productData = topProducts.stream()
            .map(product -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", product.getId());
                data.put("nom", product.getNom());
                data.put("prix", product.getPrix().doubleValue());
                data.put("stock", product.getStock());
                data.put("imageUrl", product.getImageUrl());
                // Dans une vraie application, on calculerait les ventes réelles
                data.put("totalSold", Math.max(0, 100 - product.getStock())); // Simulation
                data.put("revenue", product.getPrix().doubleValue() * Math.max(0, 100 - product.getStock()));
                return data;
            })
            .collect(Collectors.toList());
        
        result.put("products", productData);
        result.put("limit", limit);
        
        return result;
    }

    private Map<String, Double> getRevenueByPeriod(List<Order> orders, String period) {
        Map<String, Double> revenueMap = new LinkedHashMap<>();
        DateTimeFormatter formatter;
        
        switch (period.toUpperCase()) {
            case "DAY":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                break;
            case "WEEK":
                formatter = DateTimeFormatter.ofPattern("yyyy-'W'ww");
                break;
            case "MONTH":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                break;
            default:
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        }
        
        Map<String, Double> groupedRevenue = orders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getDate().format(formatter),
                Collectors.summingDouble(order -> order.getTotal().doubleValue())
            ));
        
        // Trier par date
        groupedRevenue.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> revenueMap.put(entry.getKey(), entry.getValue()));
        
        return revenueMap;
    }
}