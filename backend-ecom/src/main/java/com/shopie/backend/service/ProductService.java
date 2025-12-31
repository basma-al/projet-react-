package com.shopie.backend.service;

import com.shopie.backend.exception.ResourceNotFoundException;
import com.shopie.backend.model.Product;
import com.shopie.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getAvailableProducts() {
        return productRepository.findAvailableProducts();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé avec l'ID: " + id));
    }
    
    public List<Product> searchProducts(String nom) {
        return productRepository.findByNomContainingIgnoreCase(nom);
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setNom(productDetails.getNom());
        product.setDescription(productDetails.getDescription());
        product.setPrix(productDetails.getPrix());
        product.setImageUrl(productDetails.getImageUrl());
        product.setStock(productDetails.getStock());
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
    
    public void updateStock(Long productId, Integer newStock) {
        Product product = getProductById(productId);
        product.setStock(newStock);
        productRepository.save(product);
    }
}