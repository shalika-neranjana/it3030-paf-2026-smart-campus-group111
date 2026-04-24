package com.unireserver.backend.samarakoon.service;

import com.unireserver.backend.samarakoon.model.Review;
import com.unireserver.backend.samarakoon.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<Review> getReviewsByResource(String resourceId) {
        return reviewRepository.findByResourceIdOrderByCreatedAtDesc(resourceId);
    }

    public Review createReview(Review review) {
        review.setCreatedAt(Instant.now());
        review.setUpdatedAt(Instant.now());
        review.setLikedBy(new ArrayList<>());
        review.setResponses(new ArrayList<>());
        return reviewRepository.save(review);
    }

    public Review toggleLike(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (review.getLikedBy().contains(userId)) {
            review.getLikedBy().remove(userId);
        } else {
            review.getLikedBy().add(userId);
        }
        return reviewRepository.save(review);
    }

    public Review addResponse(String reviewId, Review.Response response) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        response.setTimestamp(Instant.now());
        if (review.getResponses() == null) {
            review.setResponses(new ArrayList<>());
        }
        review.getResponses().add(response);
        return reviewRepository.save(review);
    }

    public double getAverageRating(String resourceId) {
        List<Review> reviews = reviewRepository.findByResourceIdOrderByCreatedAtDesc(resourceId);
        if (reviews.isEmpty()) return 0.0;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }
}
