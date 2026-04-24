import React from 'react';
import './ReviewStats.css';

const ReviewStats = ({ reviews }) => {
  const average = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="review-stats">
      <div className="stat-main">
        <span className="avg-score">{average}</span>
        <span className="star-total">/ 5.0</span>
      </div>
      <div className="stat-count">
        Based on {reviews.length} community reviews
      </div>
    </div>
  );
};

export default ReviewStats;
