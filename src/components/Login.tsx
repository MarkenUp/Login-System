import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import { login } from "../features/loginAuth/authSlice";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  toggleView: () => void;
}

const Login: React.FC<LoginProps> = ({ toggleView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard"); // Redirect to dashboard if already authenticated
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8800/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        if (data.userId !== undefined && data.userId !== null) {
          dispatch(
            login({
              token: data.token,
              roles: data.roles,
              username: data.username,
              userId: data.userId,
            })
          );
          navigate("/dashboard"); // Redirect to dashboard after successful login
        } else {
          console.error("Login response does not contain userId");
        }
      } else {
        setError("Invalide username or password");
        console.error("Login failed with status:", response.status);
      }
    } catch (error) {
      setLoading(false);
      setError("An error occured during login");
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="border py-5 px-3 rounded-xl border-indigo bg-dgray shadow-xl">
      {!isAuthenticated && (
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 mb-5 border rounded hover:border-black hover:shadow-xl font-semibold text-gray-600 mt-8"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-10 border rounded hover:border-black hover:shadow-xl font-semibold text-gray-600"
          />
          <button
            onClick={handleLogin}
            className="w-full py-2 mb-4 text-white bg-darkblue rounded hover:bg-darkblueh font-semibold hover:shadow-md mt-7"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm">
            Not yet registered?{" "}
            <button
              onClick={toggleView}
              className="text-blue-500 underline hover:text-blue-700"
            >
              Register here
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
