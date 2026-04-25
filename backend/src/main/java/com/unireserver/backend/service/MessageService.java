package com.unireserver.backend.service;

import com.unireserver.backend.model.Message;
import com.unireserver.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public List<Message> getMessagesForUser(String userId) {
        return messageRepository.findByReceiverIdOrderBySentAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    public Message createMessage(Message message) {
        if (message.getSentAt() == null) {
            message.setSentAt(LocalDateTime.now());
        }
        message.setRead(false);
        return messageRepository.save(message);
    }

    public Optional<Message> updateMessage(String id, Message messageDetails) {
        return messageRepository.findById(id).map(message -> {
            message.setTitle(messageDetails.getTitle());
            message.setBody(messageDetails.getBody());
            message.setReceiverId(messageDetails.getReceiverId());
            message.setSenderId(messageDetails.getSenderId());
            return messageRepository.save(message);
        });
    }

    public boolean deleteMessage(String id) {
        return messageRepository.findById(id).map(message -> {
            messageRepository.delete(message);
            return true;
        }).orElse(false);
    }

    public Optional<Message> markAsRead(String id) {
        return messageRepository.findById(id).map(message -> {
            if (!message.isRead()) {
                message.setRead(true);
                message.setReadAt(LocalDateTime.now());
                return messageRepository.save(message);
            }
            return message;
        });
    }
}
