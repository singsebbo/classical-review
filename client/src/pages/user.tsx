import { ChangeEvent, useState } from "react";
import { RegistrationData, LoginData } from "../utils/interfaces";
import { useAuth } from "../utils/auth-context";
import { LoadingOverlay } from "../components/loading-overlay";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function User(): JSX.Element {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    username: "",
    email: "",
    password: ""
  });

  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
    rememberMe: true
  });

  function handleRegistrationChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setRegistrationData({
      ...registrationData,
      [name]: value,
    });
  }

  function handleLoginChange(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  }

  function handleRememberMeClick() {
    setLoginData({
      ...loginData,
      rememberMe: !loginData.rememberMe
    });
  }

  async function handleRegistrationSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch(`${SERVER_URL}/api/account/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password
      }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data.message)) {
          let error: string = "";
          data.message.forEach((err: {"message": string, "field": string }) => error = error.concat(err.message, "\n"));
          throw new Error(error);
        } else {
          throw new Error(data.message);
        }
      }
      return data;
    }).then((data) => {
      console.log(data);
      alert("Verification Email Sent!");
    }).catch((error) => {
      alert(error.message);
    });
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetch(`${SERVER_URL}/api/account/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username: loginData.username, password: loginData.password }),
    }).then(async (res) => {
      console.log(res);
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data.message)) {
          let error: string = "";
          data.message.forEach((err: {"message": string, "field": string }) => error = error.concat(err.message, "\n"));
          throw new Error(error);
        } else {
          throw new Error(data.message || "Login Failed");
        }
      }
      return data;
    }).then((data) => {
      console.log(data);
      localStorage.setItem("accessToken", data.accessToken);
      setIsAuthenticated(true);
      alert("You have successfully logged in");
    }).catch((error) => {
      console.error(error);
      alert(error.message);
    })
  }

  if (isAuthenticated) {
    return (
      <>
        <span>You are authenticated</span>
      </>
    )
  }

  return (
    <>
      {loading ? <LoadingOverlay />
      :
        <div className="my-auto">
          <div className="flex flex-col gap-2 p-4">
            <span className="text-2xl">Register</span>
            <form id="register-form" onSubmit={handleRegistrationSubmit} className="flex flex-col gap-2">
              <input
                name="username"
                type="text"
                placeholder="username"
                value={registrationData.username}
                onChange={handleRegistrationChange}
                className="bg-gray-200 rounded-lg px-2 py-1"
              />
              <input
                name="email"
                type="email"
                placeholder="email"
                value={registrationData.email}
                onChange={handleRegistrationChange}
                className="bg-gray-200 rounded-lg px-2 py-1"
              />
              <input
                name="password"
                type="password"
                placeholder="password"
                value={registrationData.password}
                onChange={handleRegistrationChange}
                className="bg-gray-200 rounded-lg px-2 py-1"
              />
              <input
                type="submit"
                value="Sign Up"
                className="bg-citron rounded-lg px-2 py-1"
              />
            </form>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <span className="text-2xl">Log In</span>
            <form id="login-form" onSubmit={handleLoginSubmit} className="flex flex-col gap-2">
              <input
                name="username"
                type="text"
                placeholder="username"
                value={loginData.username}
                onChange={handleLoginChange}
                className="bg-gray-200 rounded-lg px-2 py-1"
              />
              <input
                name="password"
                type="password"
                placeholder="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="bg-gray-200 rounded-lg px-2 py-1"
              />
              <div className="flex gap-2 items-center">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={loginData.rememberMe}
                  onClick={handleRememberMeClick}
                />
                <span>Remember Me</span>
              </div>
              <input
                type="submit"
                value="Sign In"
                className="bg-citron rounded-lg px-2 py-1"
              />
            </form>
          </div>
        </div>
      }
    </>
  );
}

export default User;