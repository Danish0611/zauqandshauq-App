package com.zauqandshauq.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/zauqandshauq}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:postgres}")
    private String defaultPassword;

    @Value("${DATABASE_URL:}")
    private String renderDatabaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = renderDatabaseUrl != null && !renderDatabaseUrl.isBlank() ? renderDatabaseUrl.trim() : rawUrl.trim();

        String jdbcUrl;
        String username = defaultUsername;
        String password = defaultPassword;

        if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
            try {
                String withoutProto = dbUrl.substring(dbUrl.indexOf("://") + 3);

                String query = "";
                int queryIdx = withoutProto.indexOf('?');
                if (queryIdx >= 0) {
                    query = withoutProto.substring(queryIdx);
                    withoutProto = withoutProto.substring(0, queryIdx);
                }

                int atIdx = withoutProto.lastIndexOf('@');
                String hostPortDb = withoutProto;
                if (atIdx >= 0) {
                    String userPass = withoutProto.substring(0, atIdx);
                    hostPortDb = withoutProto.substring(atIdx + 1);
                    int colonIdx = userPass.indexOf(':');
                    if (colonIdx >= 0) {
                        username = userPass.substring(0, colonIdx);
                        password = userPass.substring(colonIdx + 1);
                    } else {
                        username = userPass;
                    }
                }

                int slashIdx = hostPortDb.indexOf('/');
                String hostPort = slashIdx >= 0 ? hostPortDb.substring(0, slashIdx) : hostPortDb;
                String dbName = slashIdx >= 0 && slashIdx + 1 < hostPortDb.length() ? hostPortDb.substring(slashIdx + 1) : "zauqandshauq";

                String host = hostPort;
                int port = 5432;
                int colonIdx = hostPort.lastIndexOf(':');
                if (colonIdx >= 0) {
                    host = hostPort.substring(0, colonIdx);
                    try {
                        port = Integer.parseInt(hostPort.substring(colonIdx + 1));
                    } catch (NumberFormatException ignored) {}
                }

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName + query;
                log.info("Configured Render PostgreSQL DataSource: host={}, port={}, db={}", host, port, dbName);
            } catch (Exception e) {
                log.warn("Could not parse DATABASE_URL, fallback: {}", e.getMessage());
                jdbcUrl = dbUrl.startsWith("jdbc:") ? dbUrl : "jdbc:" + dbUrl;
            }
        } else {
            jdbcUrl = dbUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}