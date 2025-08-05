import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, MessageCircle, Phone, Video, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Expert {
  id: number;
  name: string;
  title: string;
  category: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  skills: string[];
  chatPrice: number;
  voicePrice: number;
  videoPrice: number;
  avatar?: string;
  verified: boolean;
}

const ExpertsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const experts: Expert[] = [
    {
      id: 1,
      name: "Dr. Meseret Alemu",
      title: "Business Strategy Consultant",
      category: "Business & Finance",
      rating: 4.9,
      reviewCount: 156,
      responseTime: "2-4 hours",
      skills: ["Startup Strategy", "Market Analysis", "+1"],
      chatPrice: 250,
      voicePrice: 450,
      videoPrice: 750,
      verified: true
    },
    {
      id: 2,
      name: "Abebe Tadesse",
      title: "Senior Software Developer",
      category: "Technology",
      rating: 4.8,
      reviewCount: 203,
      responseTime: "1-2 hours",
      skills: ["React Development", "System Design", "+1"],
      chatPrice: 300,
      voicePrice: 500,
      videoPrice: 800,
      verified: true
    },
    {
      id: 3,
      name: "Hanan Mohammed",
      title: "Digital Marketing Expert",
      category: "Marketing",
      rating: 5.0,
      reviewCount: 89,
      responseTime: "3-6 hours",
      skills: ["Social Media", "Content Strategy", "+1"],
      chatPrice: 200,
      voicePrice: 400,
      videoPrice: 650,
      verified: true
    },
    {
      id: 4,
      name: "Dr. Sarah Bekele",
      title: "Health & Wellness Coach",
      category: "Health & Wellness",
      rating: 4.7,
      reviewCount: 124,
      responseTime: "1-3 hours",
      skills: ["Nutrition", "Fitness Planning", "+2"],
      chatPrice: 180,
      voicePrice: 350,
      videoPrice: 600,
      verified: true
    },
    {
      id: 5,
      name: "Ato Girma Wolde",
      title: "Legal Advisor",
      category: "Legal Advice",
      rating: 4.9,
      reviewCount: 67,
      responseTime: "4-8 hours",
      skills: ["Business Law", "Contract Review", "+1"],
      chatPrice: 400,
      voicePrice: 700,
      videoPrice: 1000,
      verified: true
    },
    {
      id: 6,
      name: "Meron Assefa",
      title: "Creative Director",
      category: "Creative Arts",
      rating: 4.6,
      reviewCount: 98,
      responseTime: "2-5 hours",
      skills: ["Brand Design", "UI/UX", "+3"],
      chatPrice: 220,
      voicePrice: 420,
      videoPrice: 700,
      verified: true
    }
  ];

  const categories = ['All', 'Business & Finance', 'Technology', 'Marketing', 'Health & Wellness', 'Legal Advice', 'Creative Arts'];

  const filteredExperts = selectedCategory === 'All' 
    ? experts 
    : experts.filter(expert => expert.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Business & Finance': 'bg-blue-100 text-blue-800',
      'Technology': 'bg-purple-100 text-purple-800',
      'Marketing': 'bg-orange-100 text-orange-800',
      'Health & Wellness': 'bg-green-100 text-green-800',
      'Legal Advice': 'bg-gray-100 text-gray-800',
      'Creative Arts': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-800">Browse Experts</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Experts Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Experts</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Top-rated professionals ready to answer your questions. See their response times and choose your preferred format.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Experts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                {/* Expert Header */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    {expert.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {expert.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{expert.title}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expert.category)}`}>
                      {expert.category}
                    </span>
                  </div>
                </div>

                {/* Rating and Response Time */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-800">{expert.rating}</span>
                    <span className="text-gray-500 text-sm">({expert.reviewCount})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{expert.responseTime}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Response Formats */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Response Formats:</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{expert.chatPrice} ETB</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{expert.voicePrice} ETB</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{expert.videoPrice} ETB</span>
                    </div>
                  </div>
                </div>

                {/* Ask Question Button */}
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                  Ask a Question
                </button>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <button className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200">
              View All Experts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertsPage;