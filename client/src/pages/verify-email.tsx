import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

function VerifyEmail(): JSX.Element {
  const [verifying, setVerifying] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("Verifying");
  const [dotCount, setDotCount] = useState<number>(0);
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setVerifying(false);
      setMessage("Token does not exist!");
      return;
    }
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 200);

    fetch(`${SERVER_URL}/api/account/verify-email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
      return data;
    }).then((data) => {
      setVerifying(false);
      setMessage(data.message || "Email Successfully Verified");
      startCountdown();
    }).catch((error) => {
      setVerifying(false);
      setMessage(error.message || "An Error Occurred");
    });

    return () => clearInterval(interval);
  }, []);

  function startCountdown() {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/user');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <>
      <div className="flex flex-col my-auto text-center text-2xl">
        <span>{`${message}${verifying ? '.'.repeat(dotCount) : ""}`}</span>
        {verifying ? "" : <span className="my-2">Redirecting in {countdown}</span>}
      </div>
    </>
  )
}

export default VerifyEmail;
