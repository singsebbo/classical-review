export interface Composition {
  id: string;
  title: string;
  composerId: string;
  averageReview: number;
  totalReviews: number;
}

/** Represents a row in the compositions database */
export interface DatabaseComposition {
  composition_id: string;
  composer_id: string;
  title: string;
  subtitle: string;
  genre: string;
  average_review: number;
  total_reviews: number;
}

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
