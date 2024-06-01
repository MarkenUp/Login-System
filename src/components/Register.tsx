import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterProps {
  toggleView: () => void;
}

const Register: React.FC<RegisterProps> = ({ toggleView }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8800/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (response.ok) {
        navigate("/login"); // Redirect to login page after successful registration
      } else {
        console.error("Registration failed.");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <div className="border py-5 px-3 rounded-xl bg-dgray border-dgray shadow-xl">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-5">Register</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 mb-2 border rounded hover:border-black hover:shadow-xl font-semibold text-gray-600 mt-5"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded hover:border-black hover:shadow-xl font-semibold text-gray-600 mt-2"
        />
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-4 border rounded font-semibold text-gray-600"
        >
          <option value="" className="text-gray-600 font-semibold" disabled>
            Role
          </option>
          <option value="User" className="text-gray-600 font-semibold">
            User
          </option>
          <option value="Admin" className="text-gray-600 font-semibold">
            Admin
          </option>
        </select>
        <button
          onClick={handleRegister}
          className="w-full py-2 mb-4 text-white bg-darkblue rounded hover:bg-darkblueh font-semibold hover:shadow-md mt-5"
        >
          Register
        </button>
        <p className="text-sm">
          Not yet registered?{" "}
          <button
            onClick={toggleView}
            className="text-blue-500 underline hover:text-blue-700"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
