package com.zauqandshauq.service;

import com.zauqandshauq.model.OrderReceipt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:hello@zauqandshauq.in}")
    private String fromAddress;

    private final CopyOnWriteArrayList<EmailLog> recentEmails = new CopyOnWriteArrayList<>();

    public EmailNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public void sendOrderConfirmation(OrderReceipt receipt) {
        if (receipt == null || receipt.email() == null || receipt.email().isBlank()) return;

        String subject = "Zauq & Shauq — Order Confirmation (" + receipt.orderNumber() + ")";
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(receipt.name()).append(",\n\n");
        body.append("Thank you for choosing Zauq & Shauq. Your order ").append(receipt.orderNumber())
            .append(" has been received (Status: ").append(receipt.status()).append(").\n\n");
        body.append("YOUR SELECTION:\n");
        for (OrderReceipt.OrderLine line : receipt.items()) {
            body.append(" • ").append(line.name()).append(" × ").append(line.quantity())
                .append(" — ₹").append(line.lineTotal()).append("\n");
        }
        body.append("\nSubtotal: ₹").append(receipt.subtotal());
        if (receipt.discount() != null && receipt.discount().doubleValue() > 0) {
            body.append("\nDiscount: -₹").append(receipt.discount());
        }
        body.append("\nShipping: ₹").append(receipt.shipping());
        body.append("\nTotal: ₹").append(receipt.total()).append("\n\n");
        body.append("With warmth,\nZauq & Shauq Atelier\nJaipur, India");

        dispatchEmail(receipt.email(), subject, body.toString());
    }

    public void sendOrderStatusUpdate(OrderReceipt receipt) {
        if (receipt == null || receipt.email() == null || receipt.email().isBlank()) return;

        String subject = "Zauq & Shauq — Order Update (" + receipt.orderNumber() + " is now " + receipt.status() + ")";
        String body = "Dear " + receipt.name() + ",\n\n" +
                "Your Zauq & Shauq order " + receipt.orderNumber() + " status has been updated to: " + receipt.status() + ".\n" +
                "Order Total: ₹" + receipt.total() + "\n\n" +
                "With warmth,\nZauq & Shauq Atelier";

        dispatchEmail(receipt.email(), subject, body);
    }

    private void dispatchEmail(String to, String subject, String body) {
        boolean sentViaSmtp = false;
        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                sentViaSmtp = true;
                log.info("Transactional email sent via SMTP to {} [{}]", to, subject);
            } catch (Exception ex) {
                log.warn("SMTP send failed for {}: {}. Logged locally instead.", to, ex.getMessage());
            }
        } else {
            log.info("[Transactional Email Simulation] To: {} | Subject: {}", to, subject);
        }

        recentEmails.add(0, new EmailLog(to, subject, sentViaSmtp ? "SENT_SMTP" : "LOGGED_DEV", Instant.now()));
        while (recentEmails.size() > 50) {
            recentEmails.remove(recentEmails.size() - 1);
        }
    }

    public List<EmailLog> getRecentEmails() {
        return List.copyOf(recentEmails);
    }

    public record EmailLog(String recipient, String subject, String deliveryMode, Instant timestamp) {}
}

