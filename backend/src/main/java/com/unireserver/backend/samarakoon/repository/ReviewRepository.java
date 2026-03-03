package com.unireserver.backend.samarakoon.repository;

import com.unireserver.backend.samarakoon.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findByResourceIdOrderByCreatedAtDesc(String resourceId);
    
    List<Review> findByUserId(String userId);
}
