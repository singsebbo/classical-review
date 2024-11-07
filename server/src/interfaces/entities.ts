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
