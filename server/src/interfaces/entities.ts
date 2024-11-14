/** Represents a row in the user database. */
export interface User {
  user_id: string;
  username: string;
  email: string;
  password_hash: string;
  bio: string | null;
  created_at: Date;
  last_modified_at: Date;
  profile_picture_url: string | null;
  verified: boolean;
  last_verification_sent: Date;
}

/** Represents a row in the refresh_tokens database. */
export interface RefreshToken {
  token_id: string;
  user_id: string;
  token: string;
  created_at: Date;
  expires_at: Date;
}

/** Represents a row in the composer database. */
export interface Composer {
  composer_id: string;
  name: string;
  date_of_birth: Date;
  date_of_death: Date;
  image_url: string;
}

/** Represents a row in the compositions database. */
export interface Composition {
  composition_id: string;
  composer_id: string;
  title: string;
  subtitle: string;
  genre: string;
}
