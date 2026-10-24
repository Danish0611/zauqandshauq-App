package com.zauqandshauq.service;

import com.zauqandshauq.model.Product;
import com.zauqandshauq.model.UserEntity;
import com.zauqandshauq.repository.ProductRepository;
import com.zauqandshauq.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductDataLoader.class);
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public ProductDataLoader(ProductRepository productRepository, UserRepository userRepository, AuthService authService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Override
    public void run(String... args) {
        seedDefaultAccounts();
        seedDefaultProducts();
    }

    private void seedDefaultAccounts() {
        if (!userRepository.existsByEmailIgnoreCase("admin@zauqandshauq.in")) {
            UserEntity admin = new UserEntity();
            admin.setName("Z&S Atelier Admin");
            admin.setEmail("admin@zauqandshauq.in");
            admin.setPhone("9876543210");
            admin.setPasswordHash(authService.encodePassword("admin123"));
            admin.setRole("ADMIN");
            admin.setAddress("14 Johari Bazar, Pink City");
            admin.setCity("Jaipur");
            admin.setState("Rajasthan");
            admin.setPostalCode("302003");
            userRepository.save(admin);
            log.info("Seeded default ADMIN user: admin@zauqandshauq.in / admin123");
        }

        if (!userRepository.existsByEmailIgnoreCase("customer@zauqandshauq.in")) {
            UserEntity customer = new UserEntity();
            customer.setName("Aarav Mehta");
            customer.setEmail("customer@zauqandshauq.in");
            customer.setPhone("9811223344");
            customer.setPasswordHash(authService.encodePassword("customer123"));
            customer.setRole("CUSTOMER");
            customer.setAddress("22 Civil Lines");
            customer.setCity("Jaipur");
            customer.setState("Rajasthan");
            customer.setPostalCode("302006");
            userRepository.save(customer);
            log.info("Seeded default CUSTOMER user: customer@zauqandshauq.in / customer123");
        }
    }

    private void seedDefaultProducts() {
        if (productRepository.count() == 0) {
            log.info("Initializing products table with signature Zauq & Shauq fragrances...");

            List<Product> defaults = List.of(
                p("ZS-OUD-01", "Noir Oud", "Z&S Atelier", "For Him", "Eau de Parfum", "100 ml", 3499, 4299, 4.8, 126,
                  "A deep, smoky oud softened with warm amber and polished woods. Confident, considered, unforgettable.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Coumarin, Limonene, Evernia Prunastri (Oakmoss) Extract, Eugenol, Geraniol.",
                  "Oud, Amber, Cedarwood", "/assets/products/noir-oud.svg", "BESTSELLER", true, true, false, 95),

                p("ZS-ROSE-02", "Rose Éclat", "Maison Aurore", "For Her", "Eau de Parfum", "75 ml", 2899, 3499, 4.7, 94,
                  "Velvety rose petals meet ripe pear and a soft, skin-like musk.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citronellol, Geraniol, Hydroxycitronellal, Benzyl Salicylate, Alpha-Isomethyl Ionone.",
                  "Rose, Pear, White Musk", "/assets/products/rose-eclat.svg", "NEW ARRIVAL", true, false, true, 80),

                p("ZS-CITRUS-03", "Citrus Drift", "Verde Parfums", "Unisex", "Eau de Toilette", "100 ml", 2199, 2699, 4.6, 81,
                  "A bright, refreshing blend for sunlit mornings and easy evenings.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol, Citronellol.",
                  "Bergamot, Neroli, Vetiver", "/assets/products/citrus-drift.svg", "FRESH PICK", true, false, false, 110),

                p("ZS-AMBER-04", "Velvet Amber", "Z&S Atelier", "Unisex", "Extrait de Parfum", "50 ml", 3999, 4699, 4.9, 57,
                  "Rich amber and smooth vanilla wrapped in a long, sensual trail.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Benzoate, Vanillin, Coumarin, Farnesol, Benzyl Cinnamate.",
                  "Amber, Vanilla, Sandalwood", "/assets/products/velvet-amber.svg", "THE ARTISAN EDIT", true, true, true, 50),

                p("ZS-AZURE-05", "Azure Coast", "North & Neroli", "For Him", "Eau de Parfum", "100 ml", 2599, 3199, 4.5, 63,
                  "Cool marine notes, crisp citrus and clean aromatic woods.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Benzyl Salicylate, Citral.",
                  "Sea Salt, Lemon, Driftwood", "/assets/products/azure-coast.svg", "", false, false, false, 75),

                p("ZS-JASM-06", "Jasmine Veil", "Maison Aurore", "For Her", "Eau de Parfum", "75 ml", 3199, 3799, 4.7, 72,
                  "Luminous jasmine and orange blossom with a creamy, elegant finish.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Salicylate, Linalool, Hydroxycitronellal, Hexyl Cinnamal.",
                  "Jasmine, Orange Blossom, Musk", "/assets/products/jasmine-veil.svg", "POPULAR", false, true, false, 65),

                p("ZS-SAFF-07", "Saffron Smoke", "Oud & Earth", "Unisex", "Extrait de Parfum", "50 ml", 4499, 5299, 4.8, 41,
                  "Golden saffron and incense create a warm, expressive signature.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Eugenol, Cinnamal, Isoeugenol, Linalool, Benzyl Alcohol.",
                  "Saffron, Incense, Leather", "/assets/products/saffron-smoke.svg", "LIMITED EDITION", false, false, true, 40),

                p("ZS-FIG-08", "Green Reverie", "Verde Parfums", "Unisex", "Eau de Parfum", "100 ml", 2399, 2999, 4.4, 38,
                  "Green fig, aromatic herbs and soft woods in a modern everyday scent.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Geraniol, Citronellol.",
                  "Fig Leaf, Basil, Cedar", "/assets/products/green-reverie.svg", "", false, false, false, 70),

                p("ZS-MUSK-09", "Midnight Musk", "Z&S Atelier", "For Him", "Eau de Parfum", "100 ml", 2999, 3599, 4.6, 88,
                  "Black pepper, intimate musk and dark woods with quiet confidence.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Citronellol.",
                  "Black Pepper, Musk, Patchouli", "/assets/products/midnight-musk.svg", "BESTSELLER", false, true, false, 85),

                p("ZS-PETAL-10", "Petal Dusk", "Maison Aurore", "For Her", "Eau de Parfum", "50 ml", 1999, 2499, 4.5, 49,
                  "Soft florals and juicy plum settle into a delicate powdery base.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Benzyl Salicylate, Citronellol.",
                  "Plum, Peony, Cashmere Woods", "/assets/products/petal-dusk.svg", "GIFT FAVOURITE", false, false, false, 90),

                p("ZS-BLOOM-11", "Desert Bloom", "Oud & Earth", "Unisex", "Eau de Parfum", "100 ml", 3699, 4399, 4.7, 34,
                  "Desert rose and resinous woods, shaped into a distinctive composition.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Geraniol, Citronellol, Farnesol, Linalool.",
                  "Desert Rose, Labdanum, Oud", "/assets/products/desert-bloom.svg", "", false, false, false, 55),

                p("ZS-LINEN-12", "White Linen", "North & Neroli", "Unisex", "Eau de Toilette", "100 ml", 1899, 2299, 4.3, 29,
                  "Clean cotton, airy citrus and gentle musk for effortless freshness.",
                  "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Linalool, Limonene, Citral, Geraniol.",
                  "Linen Accord, Mandarin, White Musk", "/assets/products/white-linen.svg", "EVERYDAY LUXE", false, false, false, 120)
            );

            productRepository.saveAll(defaults);
            log.info("Successfully seeded {} signature fragrances into PostgreSQL database.", defaults.size());
        }

        if (!productRepository.existsByProductCodeIgnoreCase("ZS-COFFRET-05")) {
            Product coffret = p(
                "ZS-COFFRET-05", "The Royal Discovery Coffret", "Zauq & Shauq", "Unisex", "Discovery Wardrobe",
                "5 × 2ml Vials", 999, 2499, 5.0, 148,
                "An intimate 5-piece wardrobe of our most celebrated creations. Includes a 100% redeemable ₹999 voucher code inside.",
                "Natural botanical absolutes, aged oud resins, Mysore sandalwood oil, grain alcohol, distilled water.",
                "Oud, Damask Rose, Sandalwood, Kashmiri Saffron, Bergamot", "/assets/logo.svg", "EXCLUSIVE",
                true, true, true, 50
            );
            productRepository.save(coffret);
            log.info("Successfully seeded The Royal Discovery Coffret (ZS-COFFRET-05) into PostgreSQL database.");
        }
    }

    private Product p(String productCode, String name, String brand, String category, String concentration,
                      String size, double price, double originalPrice, double rating, int reviews,
                      String description, String ingredients, String notes, String image, String badge,
                      boolean featured, boolean bestseller, boolean newArrival, int stock) {
        Product prod = new Product();
        prod.setProductCode(productCode);
        prod.setName(name);
        prod.setBrand(brand);
        prod.setCategory(category);
        prod.setConcentration(concentration);
        prod.setSize(size);
        prod.setPrice(price);
        prod.setOriginalPrice(originalPrice);
        prod.setRating(rating);
        prod.setReviews(reviews);
        prod.setDescription(description);
        prod.setIngredients(ingredients);
        prod.setNotesText(notes);
        prod.setImage(image);
        prod.setBadge(badge);
        prod.setFeatured(featured);
        prod.setBestseller(bestseller);
        prod.setNewArrival(newArrival);
        prod.setStockQuantity(stock);
        prod.setActive(true);
        return prod;
    }
}
