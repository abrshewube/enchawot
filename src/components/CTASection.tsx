import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Clock } from 'lucide-react';

const CTASection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: "1000+",
      label: "Experts"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Rating"
    },
    {
      icon: Clock,
      value: "Fast",
      label: "Responses"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with organic shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-700">
        {/* Organic background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-green-400/30 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-yellow-400/10 to-transparent rounded-full blur-xl"></div>
          
          {/* Curved overlay shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg viewBox="0 0 800 600" className="w-full h-full">
              <path
                d="M200,300 C300,200 500,200 600,300 C700,400 500,500 400,400 C300,350 100,350 200,300 Z"
                fill="url(#ctaGradient)"
              />
              <defs>
                <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-white">Get Expert Advice</span>
          <br />
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            In Minutes
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Ask questions to trusted professionals, celebrities, influencers, and local 
          creators across Ethiopia. Get personalized responses via chat, voice, or video.
        </p>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-emerald-800" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-emerald-200 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/experts" className="bg-yellow-400 hover:bg-yellow-500 text-emerald-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center">
            Start Asking Questions
          </Link>
          <Link to="/experts" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 text-center">
            Browse Experts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;