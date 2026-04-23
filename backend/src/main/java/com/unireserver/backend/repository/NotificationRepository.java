package com.unireserver.backend.repository;

import com.unireserver.backend.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Notification entity.
 * Provides database access and custom query methods.
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * Find all notifications for a user, ordered by creation date (newest first)
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return paginated notifications for the user
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Find unread notifications for a user, ordered by creation date (newest first)
     * 
     * @param userId the user ID
     * @return list of unread notifications
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    /**
     * Count unread notifications for a user
     * 
     * @param userId the user ID
     * @return number of unread notifications
     */
    Long countByUserIdAndIsReadFalse(String userId);

    /**
     * Count all notifications for a user
     * 
     * @param userId the user ID
     * @return total number of notifications
     */
    Long countByUserId(String userId);
}
