import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Monitor, Heart, Scale, Palette, GraduationCap, TrendingUp, Stethoscope } from 'lucide-react';

const ExpertCategories: React.FC = () => {
  const categories = [
    {
      icon: Briefcase,
      title: "Business & Finance",
      description: "Entrepreneurs, investors, accountants, and business coaches",
      expertCount: "150+",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Monitor,
      title: "Technology",
      description: "Software developers, IT experts, and digital consultants",
      expertCount: "200+",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Nutritionists, fitness trainers, and wellness coaches",
      expertCount: "120+",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Scale,
      title: "Legal Advice",
      description: "Lawyers, legal consultants, and policy experts",
      expertCount: "80+",
      color: "from-gray-600 to-gray-700"
    },
    {
      icon: Palette,
      title: "Creative Arts",
      description: "Artists, designers, musicians, and content creators",
      expertCount: "180+",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: GraduationCap,
      title: "Education",
      description: "Teachers, professors, and academic tutors",
      expertCount: "100+",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: TrendingUp,
      title: "Marketing",
      description: "Digital marketers, brand strategists, and influencers",
      expertCount: "90+",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Stethoscope,
      title: "Healthcare",
      description: "Doctors, nurses, and medical specialists",
      expertCount: "70+",
      color: "from-red-500 to-red-600"
    }
  ];

  return (
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-emerald-200">
              <div className="mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
                {category.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 font-semibold text-sm">
                  {category.expertCount} experts
                </span>
                <Link to="/experts" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline transition-colors">
                  Ask Questions
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertCategories;