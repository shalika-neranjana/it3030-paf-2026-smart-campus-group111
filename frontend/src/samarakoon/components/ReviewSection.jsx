import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import ReviewStats from './ReviewStats';
import './ReviewSection.css';

const ReviewSection = ({ resourceId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/resource/${resourceId}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (resourceId) fetchReviews();
  }, [resourceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newReview, resourceId, userName: 'Current User' })
      });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="review-section">
      <h3>Community Reviews</h3>
      
      <ReviewStats reviews={reviews} />

      <div className="list-header">
        <h4>Recent Feedback</h4>
        <select onChange={(e) => {
          // Mock sort
          fetchReviews();
        }}>
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rating</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-select">
          {[1, 2, 3, 4, 5].map(num => (
            <span 
              key={num} 
              className={num <= newReview.rating ? 'star-active' : 'star-inactive'}
              onClick={() => setNewReview({ ...newReview, rating: num })}
            >
              ⭐
            </span>
          ))}
        </div>
        <textarea 
          placeholder="Share your experience..."
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          required
        />
        <button type="submit">Post Review</button>
      </form>

      <div className="review-list">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onLike={() => {}}
              onResponse={() => {}}
            />
          ))
        ) : (
          <div className="no-reviews">No reviews yet. Be the first to share your experience!</div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
