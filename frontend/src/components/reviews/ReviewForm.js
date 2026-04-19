import { useState } from 'react';
import { reviewService } from '../../services/api';
import './ReviewForm.css';

export default function ReviewForm({ listingId, onSubmit, onCancel }) {
  const [rating,  setRating]  = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await reviewService.create(listingId, { rating, comment });
      onSubmit(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hovered || rating;

  return (
    <div className="review-form">
      <h3>Your Review</h3>
      <form onSubmit={handleSubmit}>
        {/* Star picker */}
        <div className="review-form__stars">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              className={`review-star-btn ${n <= displayRating ? 'filled' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}>
              ★
            </button>
          ))}
          <span className="review-form__rating-label">
            {displayRating > 0
              ? ['','Poor','Fair','Good','Very Good','Excellent'][displayRating]
              : 'Select rating'}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Comment (optional)</label>
          <textarea
            className="form-input"
            placeholder="Share your experience…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
          />
          <span className="review-form__char-count">{comment.length}/1000</span>
        </div>

        {error && <p className="review-form__error">{error}</p>}

        <div className="review-form__actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || !rating}>
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
