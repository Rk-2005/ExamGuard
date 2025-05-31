import React from 'react';

function Navbar() {
  return (
    <nav className="navbar bg-gray-50 shadow-2xl px-4 sm:px-8 py-3">
      <div className="navbar-start">
        {/* Logo with better typography */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ExamGuard
          </span>
        </a>
      </div>
      
      {/* Desktop Navigation - Centered with proper spacing */}
      <div className="navbar-center hidden lg:flex">
        <ul className="flex space-x-8">
          <li>
            <a href="#About" className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200">
              About
            </a>
          </li>
          <li>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200">
              How It Works
            </a>
          </li>
          <li>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200">
              Pricing
            </a>
          </li>
        </ul>
      </div>
      
      {/* Mobile menu button (hamburger) */}
      <div className="navbar-end lg:hidden">
        <button className="btn btn-ghost p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Desktop Auth Buttons - Right-aligned with better spacing */}
      <div className="navbar-end hidden lg:flex space-x-4">
        <a href="/login" className="btn btn-ghost text-gray-700 hover:text-blue-600 font-medium text-lg px-4 py-2 transition-colors duration-200">
          Login
        </a>
        <a href="/signup" className="btn bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-lg px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
          Sign Up
        </a>
      </div>
    </nav>
  );
}

export default Navbar;