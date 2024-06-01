import React, { useState } from "react";
import "./css/AuthPage.css";
import Login from "./Login";
import Register from "./Register";

const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleView = () => {
    setShowLogin(!showLogin);
  };
  return (
    <div className="auth-container">
      <div
        className={`auth-card ${showLogin ? "show-login" : "show-register"}`}
      >
        <div className="login-component flex flex-col justify-center min-h-dvh">
          <Login toggleView={toggleView} />
        </div>
        <div className="register-component flex flex-col justify-center min-h-dvh">
          <Register toggleView={toggleView} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
