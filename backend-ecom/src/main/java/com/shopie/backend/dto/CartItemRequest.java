package com.shopie.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    
    @NotNull(message = "L'ID du produit est obligatoire")
    private Long productId;
    
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;
}