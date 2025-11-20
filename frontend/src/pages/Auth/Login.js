import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/auth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1B33] p-4">
      
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-scaleIn">

        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          StaffTrack Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-white text-sm">Username</label>
            <input
              className="input-field bg-white/90 border-none mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Password</label>
            <input
              type="password"
              className="input-field bg-white/90 border-none mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full mt-2"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-blue-200">
          Don’t have an account?{" "}
          <Link to="/signup" className="underline text-white hover:text-blue-300">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
