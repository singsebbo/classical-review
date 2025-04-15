export interface Composer {
  id: string;
  name: string;
  averageReview: number;
  totalReviews: number;
  imageUrl: string;
}

/** Represents a row in the composer database. */
export interface DatabaseComposer {
  composer_id: string;
  name: string;
  date_of_birth: Date | string;
  date_of_death: Date | string | null;
  image_url: string | null;
  average_review: number;
  total_reviews: number;
}
