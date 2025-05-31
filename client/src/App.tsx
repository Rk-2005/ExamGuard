import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserTestPage from "./pages/UserTestPage";
import AdminTestList from "./pages/AdminTestList";
import TestResults from "./pages/TestResults";
import { HomeRedirect } from "./pages/HomeRedirect";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/user_login" element={<UserTestPage />} />
        <Route path="/view-tests" element={<AdminTestList />} />
        <Route path="/test-results/:testId" element={<TestResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
