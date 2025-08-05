import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  MessageCircle, 
  Clock, 
  Star, 
  Users, 
  CheckCircle,
  Briefcase,
  Monitor,
  Heart,
  Scale,
  Palette,
  GraduationCap
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: "Find Your Expert",
      description: "Browse verified professionals by category, expertise, or ratings. See their response times and pricing."
    },
    {
      icon: MessageCircle,
      title: "Ask Your Question",
      description: "Choose your preferred response format (chat, voice, or video), pay upfront, and submit your question."
    },
    {
      icon: Clock,
      title: "Get Expert Response",
      description: "Receive a personalized response from your chosen expert within their average response time."
    }
  ];

  const categories = [
    {
      icon: Briefcase,
      title: "Business & Finance",
      count: "150+ experts",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Monitor,
      title: "Technology",
      count: "200+ experts",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      count: "120+ experts",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Scale,
      title: "Legal Advice",
      count: "80+ experts",
      color: "from-gray-600 to-gray-700"
    },
    {
      icon: Palette,
      title: "Creative Arts",
      count: "180+ experts",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: GraduationCap,
      title: "Education",
      count: "100+ experts",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { icon: Users, value: "1000+", label: "Experts" },
    { icon: Star, value: "4.9/5", label: "Rating" },
    { icon: Clock, value: "Fast", label: "Responses" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-400">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary-500/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-bl from-secondary-400/40 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-primary-400/20 to-transparent rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="bg-gradient-to-r from-secondary-200 via-secondary-300 to-secondary-400 bg-clip-text text-transparent drop-shadow-lg">
                ENCHAWET
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-secondary-200 mb-8 tracking-wider">
              ETHIOPIA
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with trusted professionals, celebrities, influencers, and local creators across Ethiopia. 
              Get personalized responses via chat, voice, or video.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {user ? (
                <>
                  <Link 
                    to="/experts" 
                    className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                  >
                    Ask a Question
                  </Link>
                  {user.role !== 'expert' && (
                    <Link 
                      to="/register?role=expert" 
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 text-center"
                    >
                      Become an Expert
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/register?role=expert" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                  >
                    Start Earning
                  </Link>
                  <Link 
                    to="/experts" 
                    className="bg-secondary-500 hover:bg-secondary-600 text-primary-900 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                  >
                    Ask a Question
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-secondary-400 rounded-full flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-800" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-primary-200 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
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
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Find Experts in Every Field
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From business advice to creative guidance, connect with verified professionals who 
              understand your challenges and can provide actionable solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-primary-200">
                <div className="mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {category.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold text-sm">
                    {category.count}
                  </span>
                  <Link 
                    to="/experts" 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline transition-colors"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/experts" 
              className="btn-primary inline-block"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-bl from-secondary-400/30 to-transparent rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">Get Expert Advice</span>
            <br />
            <span className="bg-gradient-to-r from-secondary-300 to-secondary-400 bg-clip-text text-transparent">
              In Minutes
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-primary-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied users who found the expert guidance they needed to succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={user ? "/experts" : "/register"} 
              className="bg-secondary-400 hover:bg-secondary-500 text-primary-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
            >
              {user ? "Ask a Question" : "Get Started"}
            </Link>
            <Link 
              to="/experts" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 text-center"
            >
              Browse Experts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;