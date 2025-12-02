// src/api.js

const API_BASE_URL = "http://localhost:9192";

export function setToken(token) {
  localStorage.setItem("jwtToken", token);
}

export function getToken() {
  return localStorage.getItem("jwtToken");
}

export function clearToken() {
  localStorage.removeItem("jwtToken");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers
  });

  return response;
}