import { useState } from "react";
import { RegistrationData, RegistrationErrors, LoginData } from "../utils/interfaces";

function User(): JSX.Element {
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    username: "",
    email: "",
    password: ""
  });

  const [registrationErrors, setRegistrationErrors] = useState<RegistrationErrors>({
    usernameErrors: [],
    emailErrors: [],
    passwordErrors: []
  });

  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
    rememberMe: false
  });

  const [isValidRegistration, setIsValidRegistration] = useState<boolean>(false);
  const [isValidLogin, setIsValidLogin] = useState<boolean>(false);

  return (
    <>
      <span>User Page</span>
    </>
  );
}

export default User;