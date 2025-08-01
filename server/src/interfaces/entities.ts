/** Represents a row in the user database. */
export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  bio: string | null;
  created_at: Date | string;
  last_modified_at: Date | string;
  profile_picture_url: string | null;
  verified: boolean;
  last_verification_sent: Date | string;
  average_review: number;
  total_reviews: number;
}

/** Represents a row in the refresh_tokens database. */
export interface RefreshToken {
  token_id: string;
  user_id: string;
  token: string;
  created_at: Date | string;
  expires_at: Date | string;
}

/** Represents a row in the composer database. */
export interface Composer {
  composer_id: string;
  name: string;
  date_of_birth: Date | string;
  date_of_death: Date | string | null;
  image_url: string | null;
  average_review: number;
  total_reviews: number;
}

/** Represents a row in the compositions database. */
export interface Composition {
  composition_id: string;
  composer_id: string;
  title: string;
  subtitle: string;
  genre: string;
  average_review: number;
  total_reviews: number;
}

/** Represents a composer in the Open Opus JSON dump */
export interface OpenOpusComposer {
  name: string;
  complete_name: string;
  epoch: string;
  birth: string;
  death: string | null;
  popular: string;
  recommended: string | null;
  works: OpenOpusWork[];
}

/** Represents a composition in the OpenOpus JSON dump */
export interface OpenOpusWork {
  title: string;
  subtitle: string;
  searchterms: string;
  popular: string;
  recommended: string;
  genre: string;
}

/** Represents a review in the reviews database. */
export interface Review {
  review_id: string;
  composition_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: Date | string;
  last_modified_at: Date | string;
  num_liked: number;
}

/** Represents a row in the liked_reviews database */
export interface LikedReview {
  user_id: string;
  review_id: string;
  liked_at: Date | string;
}
