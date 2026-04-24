package com.unireserver.backend.samarakoon.service;

import com.unireserver.backend.samarakoon.model.Review;
import com.unireserver.backend.samarakoon.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createReview_ShouldInitializeLists() {
        Review review = Review.builder().rating(5).comment("Test").build();
        when(reviewRepository.save(any())).thenReturn(review);

        Review result = reviewService.createReview(review);

        assertNotNull(result.getLikedBy());
        assertNotNull(result.getResponses());
        verify(reviewRepository, times(1)).save(review);
    }

    @Test
    void toggleLike_ShouldAddUserIfNotPresent() {
        Review review = Review.builder().id("1").likedBy(new ArrayList<>()).build();
        when(reviewRepository.findById("1")).thenReturn(Optional.of(review));
        when(reviewRepository.save(any())).thenReturn(review);

        Review result = reviewService.toggleLike("1", "user1");

        assertTrue(result.getLikedBy().contains("user1"));
    }
}
