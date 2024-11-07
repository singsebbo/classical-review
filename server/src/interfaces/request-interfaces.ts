/** Data from the user when registering an account. */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

/** Data from the user when logging in. */
export interface LoginData {
  username: string;
  password: string;
}
