import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-yellow-400">
        {/* Organic Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-500/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-bl from-yellow-400/40 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-green-400/20 to-transparent rounded-full blur-xl"></div>
          
          {/* Curved Shape Overlays */}
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2">
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
              <path
                d="M100,200 C150,100 250,100 300,200 C350,300 250,350 200,300 C150,250 50,250 100,200 Z"
                fill="url(#greenGold)"
              />
              <defs>
                <linearGradient id="greenGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-5 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
              ENCHAWET
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-light text-yellow-200 mb-16 tracking-wider">
            ETHIOPIA
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/experts" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center">
              START EARNING
            </Link>
            <Link to="/experts" className="bg-yellow-500 hover:bg-yellow-600 text-emerald-900 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center">
              ASK A QUESTION
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;