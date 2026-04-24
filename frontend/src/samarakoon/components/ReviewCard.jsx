import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review, onLike, onResponse }) => {
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="review-card">
      <div className="review-card-header">
        <span className="user-name">{review.userName}</span>
        <span className="stars">{renderStars(review.rating)}</span>
      </div>
      <p className="comment">{review.comment}</p>
      <div className="review-card-footer">
        <span className="date">{new Date(review.createdAt).toLocaleDateString()}</span>
        <div className="actions">
          <button onClick={() => onLike(review.id)}>
            ❤️ {review.likedBy?.length || 0}
          </button>
          <button onClick={() => onResponse(review.id)}>
            💬 {review.responses?.length || 0}
          </button>
        </div>
      </div>
      
      {review.responses?.length > 0 && (
        <div className="responses-section">
          {review.responses.map((resp, idx) => (
            <div key={idx} className="response-item">
              <strong>{resp.userName}:</strong> {resp.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
