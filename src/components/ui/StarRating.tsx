import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({
  rating = 0,
  onRate,
  readonly = false,
  size = 20,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            size={size}
            className={`transition ${
              star <= (hover || rating)
                ? "fill-[#F4A261] text-[#F4A261]"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}