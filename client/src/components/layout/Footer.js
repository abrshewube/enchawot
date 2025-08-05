import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const userLinks = [
    { name: 'Find Experts', path: '/experts' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Help Center', path: '/help' }
  ];

  const expertLinks = [
    { name: 'Become an Expert', path: '/become-expert' },
    { name: 'Expert Guidelines', path: '/expert-guidelines' },
    { name: 'Expert Resources', path: '/expert-resources' },
    { name: 'Community', path: '/community' }
  ];

  return (
    <footer className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold">Enchawet Ethiopia</span>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed mb-6">
              Connecting Ethiopia with expert knowledge. Ask questions and get personalized responses from trusted
              professionals via chat, voice, or video.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-800 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-800 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center hover:bg-primary-800 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-lg font-semibold text-secondary-400 mb-4">For Users</h4>
            <ul className="space-y-3">
              {userLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-primary-100 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Experts */}
          <div>
            <h4 className="text-lg font-semibold text-secondary-400 mb-4">For Experts</h4>
            <ul className="space-y-3">
              {expertLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-primary-100 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold text-secondary-400 mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-200" />
                <span className="text-primary-100 text-sm">support@enchawet.et</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-200" />
                <span className="text-primary-100 text-sm">+251 911 123 456</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-200 mt-0.5" />
                <span className="text-primary-100 text-sm">Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-500 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-200 text-sm">© 2024 Enchawet Ethiopia. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-primary-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-primary-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-primary-200 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;