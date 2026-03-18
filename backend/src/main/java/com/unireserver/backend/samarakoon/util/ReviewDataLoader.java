package com.unireserver.backend.samarakoon.util;

import com.unireserver.backend.samarakoon.model.Review;
import com.unireserver.backend.samarakoon.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class ReviewDataLoader implements CommandLineRunner {

    private final ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        if (reviewRepository.count() == 0) {
            Review r1 = Review.builder()
                    .resourceId("res1")
                    .userId("user1")
                    .userName("John Doe")
                    .rating(5)
                    .comment("Excellent facilities! The lab is very well-equipped.")
                    .createdAt(Instant.now())
                    .build();

            Review r2 = Review.builder()
                    .resourceId("res1")
                    .userId("user2")
                    .userName("Jane Smith")
                    .rating(4)
                    .comment("Great place to study, but the AC was a bit loud.")
                    .createdAt(Instant.now().minusSeconds(86400))
                    .build();

            reviewRepository.saveAll(Arrays.asList(r1, r2));
            System.out.println("Review mock data loaded.");
        }
    }
}
