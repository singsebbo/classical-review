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

/** Represents the data required to register */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

/** Represents the data required to sign in */
export interface LoginData {
  username: string;
  password: string;
  rememberMe: boolean;
}

/** Represents the user details returned from GET /api/account/info */
export interface UserDetails {
  user_id: string;
  username: string;
  email: string;
  bio: string | null;
  created_at: Date | string;
  last_modified_at: Date | string;
  profile_picture_url: string | null;
  verified: boolean;
  last_verification_sent: Date | string;
  average_review: number;
  total_reviews: number;
}

/** Represents a row in the reviews database */
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
