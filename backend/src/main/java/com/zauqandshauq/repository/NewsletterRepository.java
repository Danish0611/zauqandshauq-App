package com.zauqandshauq.repository;

import com.zauqandshauq.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterRepository extends JpaRepository<NewsletterSubscriber, Long> {
    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<NewsletterSubscriber> findAllByOrderBySubscribedAtDesc();
}

