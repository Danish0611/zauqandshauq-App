package com.zauqandshauq.service;

import com.zauqandshauq.dto.CsvUploadResponse;
import com.zauqandshauq.model.Product;
import com.zauqandshauq.repository.ProductRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> find(String category, String q, String sort) {
        Sort sortObj = resolveSort(sort);
        String categoryParam = (category == null || category.isBlank() || category.equalsIgnoreCase("All Fragrances"))
                ? null : category.trim();
        String queryParam = (q == null || q.isBlank()) ? null : q.trim();

        return productRepository.searchProducts(categoryParam, queryParam, sortObj);
    }

    public List<Product> all() {
        return productRepository.findAll(Sort.by(Sort.Direction.DESC, "featured").and(Sort.by(Sort.Direction.ASC, "id")));
    }

    public Optional<Product> findById(long id) {
        return productRepository.findById(id);
    }

    public Optional<Product> findByProductCode(String productCode) {
        if (productCode == null || productCode.isBlank()) return Optional.empty();
        return productRepository.findByProductCodeIgnoreCase(productCode.trim());
    }

    public List<String> categories() {
        List<String> list = new ArrayList<>();
        list.add("All Fragrances");
        List<String> dbCategories = productRepository.findDistinctCategories();
        for (String c : dbCategories) {
            if (c != null && !c.isBlank() && !list.contains(c)) {
                list.add(c);
            }
        }
        return list;
    }

    @Transactional
    public Product save(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public CsvUploadResponse processCsvUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The uploaded CSV file is empty. Please select a valid CSV file.");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!fileName.endsWith(".csv") && !Objects.equals(file.getContentType(), "text/csv") && !Objects.equals(file.getContentType(), "application/vnd.ms-excel")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file format. Please upload a standard .csv file.");
        }

        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int insertedCount = 0;
        int updatedCount = 0;

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, csvFormat)) {
                for (CSVRecord record : parser) {
                    totalRows++;
                    try {
                        String productCode = getVal(record, "product_code", "productCode", "code", "sku");
                        String name = getVal(record, "name", "product_name", "productName");
                        String brand = getVal(record, "brand", "maker");
                        String category = getVal(record, "category", "type");
                        String concentration = getVal(record, "concentration");
                        String size = getVal(record, "size", "volume");
                        String priceStr = getVal(record, "price");
                        String origPriceStr = getVal(record, "original_price", "originalPrice", "mrp");
                        String ratingStr = getVal(record, "rating");
                        String reviewsStr = getVal(record, "reviews");
                        String description = getVal(record, "description");
                        String ingredients = getVal(record, "ingredients");
                        String notes = getVal(record, "notes", "notes_text", "scent_notes");
                        String image = getVal(record, "image", "image_url", "imageUrl");
                        String badge = getVal(record, "badge", "tag");
                        String featuredStr = getVal(record, "featured");
                        String bestsellerStr = getVal(record, "bestseller");
                        String newArrivalStr = getVal(record, "new_arrival", "newArrival");
                        String stockStr = getVal(record, "stock_quantity", "stockQuantity", "stock");

                        if (name.isBlank()) {
                            errors.add("Row " + totalRows + ": 'name' is required.");
                            continue;
                        }

                        if (productCode.isBlank()) {
                            productCode = "ZS-" + name.replaceAll("[^a-zA-Z0-9]", "").toUpperCase() + "-" + totalRows;
                        }

                        double price = 0.0;
                        try {
                            price = Double.parseDouble(priceStr.replaceAll("[^0-9.]", ""));
                        } catch (Exception ex) {
                            errors.add("Row " + totalRows + ": Invalid price '" + priceStr + "'.");
                            continue;
                        }

                        double originalPrice = price;
                        if (!origPriceStr.isBlank()) {
                            try {
                                originalPrice = Double.parseDouble(origPriceStr.replaceAll("[^0-9.]", ""));
                            } catch (Exception ignored) {}
                        }

                        double rating = 4.8;
                        if (!ratingStr.isBlank()) {
                            try { rating = Double.parseDouble(ratingStr); } catch (Exception ignored) {}
                        }

                        int reviews = 0;
                        if (!reviewsStr.isBlank()) {
                            try { reviews = Integer.parseInt(reviewsStr); } catch (Exception ignored) {}
                        }

                        int stockQuantity = 100;
                        if (!stockStr.isBlank()) {
                            try { stockQuantity = Integer.parseInt(stockStr); } catch (Exception ignored) {}
                        }

                        boolean featured = parseBool(featuredStr, false);
                        boolean bestseller = parseBool(bestsellerStr, false);
                        boolean newArrival = parseBool(newArrivalStr, false);

                        if (brand.isBlank()) brand = "Z&S Atelier";
                        if (category.isBlank()) category = "Unisex";
                        if (concentration.isBlank()) concentration = "Eau de Parfum";
                        if (size.isBlank()) size = "100 ml";
                        if (image.isBlank()) image = "/assets/products/noir-oud.svg";

                        Optional<Product> existingOpt = productRepository.findByProductCodeIgnoreCase(productCode);
                        Product product;
                        if (existingOpt.isPresent()) {
                            product = existingOpt.get();
                            updatedCount++;
                        } else {
                            product = new Product();
                            product.setProductCode(productCode);
                            insertedCount++;
                        }

                        product.setName(name);
                        product.setBrand(brand);
                        product.setCategory(category);
                        product.setConcentration(concentration);
                        product.setSize(size);
                        product.setPrice(price);
                        product.setOriginalPrice(originalPrice);
                        product.setRating(rating);
                        product.setReviews(reviews);
                        product.setDescription(description);
                        product.setIngredients(ingredients);
                        product.setNotesText(notes);
                        product.setImage(image);
                        product.setBadge(badge);
                        product.setFeatured(featured);
                        product.setBestseller(bestseller);
                        product.setNewArrival(newArrival);
                        product.setStockQuantity(stockQuantity);
                        product.setActive(true);

                        productRepository.save(product);

                    } catch (Exception rowEx) {
                        errors.add("Row " + totalRows + ": Error processing row - " + rowEx.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read CSV input stream: " + e.getMessage());
        }

        String message = String.format("CSV upload processed: %d total rows, %d inserted, %d updated.", totalRows, insertedCount, updatedCount);
        if (!errors.isEmpty()) {
            message += String.format(" %d rows had errors.", errors.size());
        }

        return new CsvUploadResponse(errors.isEmpty() || insertedCount + updatedCount > 0, message, totalRows, insertedCount, updatedCount, errors);
    }

    public byte[] generateCsvTemplate() {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.builder().setHeader(
                "product_code", "name", "brand", "category", "concentration", "size",
                "price", "original_price", "rating", "reviews", "description",
                "ingredients", "notes", "image", "badge", "featured", "bestseller",
                "new_arrival", "stock_quantity"
        ).build())) {
            printer.printRecord(
                    "ZS-OUD-01", "Noir Oud", "Z&S Atelier", "For Him", "Eau de Parfum", "100 ml",
                    "3499.00", "4299.00", "4.8", "126",
                    "A deep, smoky oud softened with warm amber and polished woods. Confident, considered, unforgettable.",
                    "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Coumarin, Limonene, Evernia Prunastri Extract.",
                    "Oud, Amber, Cedarwood", "/assets/products/noir-oud.svg", "BESTSELLER",
                    "true", "true", "false", "100"
            );
            printer.printRecord(
                    "ZS-ROSE-02", "Rose Éclat", "Maison Aurore", "For Her", "Eau de Parfum", "75 ml",
                    "2899.00", "3499.00", "4.7", "94",
                    "Velvety rose petals meet ripe pear and a soft, skin-like musk.",
                    "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Geraniol, Citronellol, Hydroxycitronellal, Benzyl Salicylate.",
                    "Rose, Pear, White Musk", "/assets/products/rose-eclat.svg", "NEW ARRIVAL",
                    "true", "false", "true", "85"
            );
            printer.printRecord(
                    "ZS-CITRUS-03", "Citrus Drift", "Verde Parfums", "Unisex", "Eau de Toilette", "100 ml",
                    "2199.00", "2699.00", "4.6", "81",
                    "A bright, refreshing blend for sunlit mornings and easy evenings.",
                    "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol.",
                    "Bergamot, Neroli, Vetiver", "/assets/products/citrus-drift.svg", "FRESH PICK",
                    "true", "false", "false", "60"
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate CSV template");
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportProductsCsv() {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.builder().setHeader(
                "product_code", "name", "brand", "category", "concentration", "size",
                "price", "original_price", "rating", "reviews", "description",
                "ingredients", "notes", "image", "badge", "featured", "bestseller",
                "new_arrival", "stock_quantity"
        ).build())) {
            List<Product> products = productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
            for (Product p : products) {
                printer.printRecord(
                        p.getProductCode(), p.getName(), p.getBrand(), p.getCategory(), p.getConcentration(), p.getSize(),
                        p.getPrice(), p.getOriginalPrice(), p.getRating(), p.getReviews(), p.getDescription(),
                        p.getIngredients(), p.getNotesText(), p.getImage(), p.getBadge(),
                        p.isFeatured(), p.isBestseller(), p.isNewArrival(), p.getStockQuantity()
                );
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export products to CSV");
        }
        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank() || sort.equalsIgnoreCase("featured")) {
            return Sort.by(Sort.Direction.DESC, "featured").and(Sort.by(Sort.Direction.ASC, "id"));
        }
        return switch (sort.toLowerCase()) {
            case "price-low" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-high" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "name" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.DESC, "featured").and(Sort.by(Sort.Direction.ASC, "id"));
        };
    }

    private String getVal(CSVRecord record, String... keys) {
        for (String k : keys) {
            if (record.isMapped(k)) {
                String val = record.get(k);
                if (val != null) return val.trim();
            }
        }
        return "";
    }

    private boolean parseBool(String val, boolean def) {
        if (val == null || val.isBlank()) return def;
        String s = val.trim().toLowerCase();
        return s.equals("true") || s.equals("1") || s.equals("yes");
    }
}
