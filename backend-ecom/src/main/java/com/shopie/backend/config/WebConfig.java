package com.shopie.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Désactiver la gestion des ressources statiques pour les endpoints admin
        // Cela évite que Spring Boot traite /admin/** comme des ressources statiques
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        // Laisser les autres ressources statiques par défaut
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
}