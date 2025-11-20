import React, { useState } from "react";
import { signup } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    company_name: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signup(form.username, form.email, form.password, form.company_name);
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1B33] p-4">

      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-scaleIn">

        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-white text-sm">Username</label>
            <input
              name="username"
              className="input-field bg-white/90 border-none mt-1"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Email</label>
            <input
              name="email"
              type="email"
              className="input-field bg-white/90 border-none mt-1"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Password</label>
            <input
              name="password"
              type="password"
              className="input-field bg-white/90 border-none mt-1"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Company Name</label>
            <input
              name="company_name"
              className="input-field bg-white/90 border-none mt-1"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button className="btn-primary w-full mt-2" type="submit">
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-blue-200">
          Already have an account?{" "}
          <Link to="/login" className="underline text-white hover:text-blue-300">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
