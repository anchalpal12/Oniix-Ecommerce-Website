export default function StarRating({ rating = 0, reviewCount, size = 'sm' }) {
  const value = Number(rating) || 0;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full';
    if (i === full && half) return 'half';
    return 'empty';
  });

  return (
    <div className={`star-rating star-rating--${size}`} aria-label={`Rated ${value} out of 5`}>
      <span className="star-rating-stars" aria-hidden>
        {stars.map((type, i) => (
          <span key={i} className={`star star--${type}`}>★</span>
        ))}
      </span>
      {size !== 'sm' || reviewCount != null ? (
        <>
          <span className="star-rating-value">{value.toFixed(1)}</span>
          {reviewCount != null && (
            <span className="star-rating-count">({reviewCount.toLocaleString('en-IN')})</span>
          )}
        </>
      ) : (
        <span className="star-rating-value">{value.toFixed(1)}</span>
      )}
    </div>
  );
}

export function StarInput({ value = 5, onChange }) {
  return (
    <div className="star-input" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-input-btn${star <= value ? ' active' : ''}`}
          onClick={() => onChange(star)}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
