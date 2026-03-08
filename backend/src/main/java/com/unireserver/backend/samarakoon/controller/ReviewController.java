package com.unireserver.backend.samarakoon.controller;

import com.unireserver.backend.samarakoon.model.Review;
import com.unireserver.backend.samarakoon.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable String resourceId) {
        return ResponseEntity.ok(reviewService.getReviewsByResource(resourceId));
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.createReview(review));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Review> toggleLike(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.toggleLike(id, body.get("userId")));
    }

    @PostMapping("/{id}/responses")
    public ResponseEntity<Review> addResponse(@PathVariable String id, @RequestBody Review.Response response) {
        return ResponseEntity.ok(reviewService.addResponse(id, response));
    }
}
