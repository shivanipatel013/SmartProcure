package com.procurehub.procurehub;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ProcurehubApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProcurehubApplication.class, args);
	}

    @Bean
    CommandLineRunner testConnection(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE product MODIFY COLUMN status VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Product status column adjust: " + e.getMessage());
            }
            try {
                jdbcTemplate.execute("ALTER TABLE supplier MODIFY COLUMN status VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Supplier status column adjust: " + e.getMessage());
            }
            try {
                jdbcTemplate.execute("ALTER TABLE supplier ADD COLUMN IF NOT EXISTS mpin VARCHAR(20)");
            } catch (Exception e) {
                // Ignore if exists
            }
            System.out.println("=================================");
            System.out.println("Database Connected & Schema Synced");
            System.out.println("=================================");
        };
    }
}
	
