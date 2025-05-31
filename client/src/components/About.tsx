import React from 'react';

function About() {
  return (
    <section id='About' className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-transparent  bg-clip-text  bg-gradient-to-r from-blue-600 to-indigo-600">ExamGuard: Protecting Academic Integrity</span>
          </h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced proctoring technology that ensures fair testing environments without compromising privacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Core Features */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Advanced Cheating Prevention
              </h3>
              <p className="text-gray-700">
                Detects and blocks tab switching, copy-paste actions, and unauthorized applications during exams with 99.7% accuracy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Lightweight Technology
              </h3>
              <p className="text-gray-700">
                Browser-based solution requiring no software installations, ensuring zero impact on exam performance.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                AI-Powered Monitoring
              </h3>
              <p className="text-gray-700">
                Real-time behavior analysis detects suspicious activities without invasive camera monitoring.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Educator Dashboard
              </h3>
              <p className="text-gray-700">
                Comprehensive reporting tools with detailed analytics on exam sessions and integrity flags.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4">
            ExamGuard was founded to create a fair testing environment for the digital age. We combine cutting-edge technology with respect for student privacy to deliver proctoring solutions that educators trust and students accept.
          </p>
          <p className="text-lg text-gray-700">
            Unlike traditional systems, our browser-based approach eliminates technical barriers while maintaining rigorous academic standards across online exams, certifications, and assessments.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;