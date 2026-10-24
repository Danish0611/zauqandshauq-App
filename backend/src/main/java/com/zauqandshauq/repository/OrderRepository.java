package com.zauqandshauq.repository;

import com.zauqandshauq.model.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    Optional<OrderEntity> findByOrderNumber(String orderNumber);
    Optional<OrderEntity> findByRazorpayOrderId(String razorpayOrderId);
    List<OrderEntity> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OrderEntity> findAllByOrderByCreatedAtDesc();
}

