import React from 'react';
import exam from "../assets/Image2.png"
function Banner() {
  return (
    <section className="relative bg-gradient-to-br from-blue-100 via-white to-indigo-100 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Integrity in Online Exams
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Ensure fair assessments with cutting-edge tab-switching prevention and AI-powered proctoring technology.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Get Started
              </button>
              <button className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Demo Image */}
          <div className="lg:w-1/3 rounded-2xl overflow-hidden shadow-2xl border-8 border-white transform hover:scale-105 transition-transform duration-500">
            <img 
              src={exam} 
              alt="ExamGuard demo showcasing cheating prevention features" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Trusted By Section */}
        <div className="mt-16 pt-10 border-t border-gray-200 animate-fade-in">
          <p className="text-center text-gray-500 uppercase text-sm font-semibold tracking-widest mb-8">
            Trusted by Leading Educational Institutions
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {['UNIVERSITY A', 'UNIVERSITY B', 'COLLEGE C', 'INSTITUTE D'].map((institution) => (
              <div 
                key={institution} 
                className="text-gray-700 font-semibold text-lg hover:text-blue-600 transition-colors duration-300"
              >
                {institution}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;