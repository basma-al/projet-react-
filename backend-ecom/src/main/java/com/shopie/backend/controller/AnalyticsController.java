package com.shopie.backend.controller;

import com.shopie.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/analytics")
@Tag(name = "Analytics", description = "API d'analyse et de rapports (Admin uniquement)")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Statistiques du tableau de bord", description = "Récupère les statistiques principales pour le tableau de bord")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sales")
    @Operation(summary = "Statistiques des ventes", description = "Récupère les statistiques de ventes avec filtres de date")
    public ResponseEntity<Map<String, Object>> getSalesStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "MONTH") String period) {
        
        Map<String, Object> stats = analyticsService.getSalesStats(startDate, endDate, period);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/products")
    @Operation(summary = "Statistiques des produits", description = "Récupère les statistiques des produits les plus vendus, stock faible, etc.")
    public ResponseEntity<Map<String, Object>> getProductStats() {
        Map<String, Object> stats = analyticsService.getProductStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/customers")
    @Operation(summary = "Statistiques des clients", description = "Récupère les statistiques des clients les plus actifs")
    public ResponseEntity<Map<String, Object>> getCustomerStats() {
        Map<String, Object> stats = analyticsService.getCustomerStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/orders")
    @Operation(summary = "Statistiques des commandes", description = "Récupère les statistiques des commandes par statut, période, etc.")
    public ResponseEntity<Map<String, Object>> getOrderStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> stats = analyticsService.getOrderStats(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue-chart")
    @Operation(summary = "Données pour graphique de revenus", description = "Récupère les données pour afficher un graphique de revenus")
    public ResponseEntity<Map<String, Object>> getRevenueChartData(
            @RequestParam(defaultValue = "MONTH") String period,
            @RequestParam(defaultValue = "12") int limit) {
        
        Map<String, Object> chartData = analyticsService.getRevenueChartData(period, limit);
        return ResponseEntity.ok(chartData);
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top produits", description = "Récupère les produits les plus vendus")
    public ResponseEntity<Map<String, Object>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> topProducts = analyticsService.getTopProducts(limit, startDate, endDate);
        return ResponseEntity.ok(topProducts);
    }
}