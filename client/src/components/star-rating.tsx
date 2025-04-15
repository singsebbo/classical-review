import { Star } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: 5 }, (_, i) => {
        const fillPercent = Math.min(Math.max(rating - i, 0), 1) * 100;

        return (
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-300 fill-gray-300" />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
