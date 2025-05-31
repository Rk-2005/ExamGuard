import React from 'react';
import examDemoGif from '../assets/water.gif'; // Replace with your actual demo GIF path

function Banner() {
  return (
    <section className="bg-gradient-to-r pt-10  from-gray-50 to-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Integrity in Online Exams
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Prevent cheating with our advanced tab-switching prevention and AI-powered monitoring technology
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                Get Started
              </button>
              <button className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-50 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Demo GIF */}
          <div className="lg:w-1/2 rounded-xl overflow-hidden shadow-2xl border-8 border-white">
            <img 
              src={examDemoGif} 
              alt="ExamGuard demo showing cheating prevention features" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Trusted By Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 uppercase text-sm font-semibold tracking-wider mb-6">
            Trusted by Leading Educational Institutions
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
            {['UNIVERSITY A', 'UNIVERSITY B', 'COLLEGE C', 'INSTITUTE D'].map((institution) => (
              <div key={institution} className="text-gray-700 font-medium text-lg">
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