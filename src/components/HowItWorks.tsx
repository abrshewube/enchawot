import React from 'react';
import { Search, MessageCircle, Clock } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: "Find Your Expert",
      description: "Browse verified professionals by category, expertise, or ratings. See their response times and pricing for chat, voice, and video."
    },
    {
      icon: MessageCircle,
      title: "Ask Your Question",
      description: "Choose your preferred response format (chat, voice, or video), pay upfront, and submit your detailed question."
    },
    {
      icon: Clock,
      title: "Get Expert Response",
      description: "Receive a personalized response from your chosen expert within their average response time. Quality guaranteed."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Getting expert advice has never been easier. Just three simple steps to get 
            personalized responses from professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon Container */}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-emerald-600 transition-colors">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connection Lines */}
        <div className="hidden md:block relative mt-12">
          <div className="absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-emerald-300 to-yellow-300 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-emerald-300 to-yellow-300 transform -translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;