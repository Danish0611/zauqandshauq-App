package com.zauqandshauq.service;

import com.zauqandshauq.dto.CsvUploadResponse;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository productRepository;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        productService = new ProductService(productRepository);
    }

    @Test
    void generatesCsvTemplate() {
        byte[] csvBytes = productService.generateCsvTemplate();
        assertNotNull(csvBytes);
        String csvString = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvString.contains("product_code"));
        assertTrue(csvString.contains("ingredients"));
        assertTrue(csvString.contains("Noir Oud"));
    }

    @Test
    void processesCsvUploadWithUpsert() {
        String csvContent = """
                product_code,name,brand,category,concentration,size,price,original_price,rating,reviews,description,ingredients,notes,image,badge,featured,bestseller,new_arrival,stock_quantity
                ZS-TEST-01,Test Perfume,Test Brand,Unisex,Eau de Parfum,100 ml,2499,2999,4.9,10,"A divine fragrance.","Alcohol Denat.","Amber, Wood",/assets/test.svg,NEW,true,false,true,50
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "perfumes.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        when(productRepository.findByProductCodeIgnoreCase("ZS-TEST-01")).thenReturn(Optional.empty());

        CsvUploadResponse response = productService.processCsvUpload(file);

        assertTrue(response.success());
        assertEquals(1, response.totalRows());
        assertEquals(1, response.insertedCount());
        assertEquals(0, response.updatedCount());
        assertTrue(response.errors().isEmpty());

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());

        Product saved = captor.getValue();
        assertEquals("ZS-TEST-01", saved.getProductCode());
        assertEquals("Test Perfume", saved.getName());
        assertEquals(2499.0, saved.getPrice());
        assertEquals("Alcohol Denat.", saved.getIngredients());
        assertEquals(50, saved.getStockQuantity());
    }
}
