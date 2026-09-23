package com.procurehub.procurehub.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.procurehub.procurehub.entity.Product;
import com.procurehub.procurehub.entity.ProductRating;
import com.procurehub.procurehub.entity.Supplier;
import com.procurehub.procurehub.repository.ProductRatingRepository;
import com.procurehub.procurehub.repository.ProductRepository;
import com.procurehub.procurehub.repository.SupplierRepository;

@RestController
@RequestMapping("/product-rating")
public class ProductRatingController {

    @Autowired
    private ProductRatingRepository ratingRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;


    // Add Product Rating
    @PostMapping
    public ProductRating addRating(
            @RequestBody ProductRating rating) {

        if (rating.getRating() == null ||
            rating.getRating() < 1 ||
            rating.getRating() > 5) {

            throw new RuntimeException(
                "Rating must be between 1 and 5"
            );
        }

        if (rating.getProduct() == null ||
            rating.getProduct().getProductId() == null) {

            throw new RuntimeException(
                "Product ID is required"
            );
        }

        if (rating.getSupplier() == null ||
            rating.getSupplier().getSupplierId() == null) {

            throw new RuntimeException(
                "Supplier ID is required"
            );
        }

        Product product = productRepository
                .findById(
                    rating.getProduct().getProductId()
                )
                .orElseThrow(() ->
                    new RuntimeException(
                        "Product not found"
                    )
                );

        Supplier supplier = supplierRepository
                .findById(
                    rating.getSupplier().getSupplierId()
                )
                .orElseThrow(() ->
                    new RuntimeException(
                        "Supplier not found"
                    )
                );

        rating.setProduct(product);
        rating.setSupplier(supplier);
        rating.setRatingDate(LocalDateTime.now());

        return ratingRepository.save(rating);
    }


    // Get All Ratings
    @GetMapping
    public List<ProductRating> getAllRatings() {
        return ratingRepository.findAll();
    }


    // Get Rating By ID
    @GetMapping("/{id}")
    public ProductRating getRatingById(
            @PathVariable Long id) {

        return ratingRepository
                .findById(id)
                .orElse(null);
    }
}