// src/services/auth.js

import api from "../api/axios";

// =========================
// HR SIGNUP
// =========================
export async function signup(username, email, password, company_name) {
  const res = await api.post("/auth/register", {
    username,
    email,
    password,
    company_name,
  });

  return res.data; // backend returns { id, username, email, company_name }
}

// =========================
// HR LOGIN
// =========================
export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // Backend returns ONLY: { access_token, token_type }
  localStorage.setItem("access_token", res.data.access_token);

  return res.data;
}

// =========================
// LOGOUT
// =========================
export function logout() {
  localStorage.removeItem("access_token");
}

// =========================
// CHECK LOGIN
// =========================
export function isLoggedIn() {
  return !!localStorage.getItem("access_token");
}
