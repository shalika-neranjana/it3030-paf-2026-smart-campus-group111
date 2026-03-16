package com.unireserver.backend.repository;

import com.unireserver.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByReceiverIdOrderBySentAtDesc(String receiverId);
    long countByReceiverIdAndIsReadFalse(String receiverId);
}
