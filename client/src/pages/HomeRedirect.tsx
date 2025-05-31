import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Home from "./Home"; // your Home page

export function HomeRedirect() {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded?.role === "admin") {
        return <Navigate to="/dashboard" />;
      } else if (decoded?.role === "student") {
        return <Navigate to="/user_login" />;
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token"); // optional: clean up
    }
  }

  return <Home />; // default if no token or invalid
}
