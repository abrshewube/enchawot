import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const userLinks = ["Ask Questions", "How it Works", "Response Formats", "Success Stories", "Help Center"]

  const expertLinks = ["Become an Expert", "Expert Guidelines", "Earnings Calculator", "Expert Resources", "Community"]

  return (
    <footer className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-orange-400 mb-4">Enchawet Ethiopia</h3>
            <p className="text-green-100 text-sm leading-relaxed mb-6">
              Connecting Ethiopia with expert knowledge. Ask questions and get personalized responses from trusted
              professionals via chat, voice, or video.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 cursor-pointer transition-colors">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 cursor-pointer transition-colors">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 cursor-pointer transition-colors">
                <Instagram className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-4">For Users</h4>
            <ul className="space-y-3">
              {userLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Experts */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-4">For Experts</h4>
            <ul className="space-y-3">
              {expertLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-200" />
                <span className="text-green-100 text-sm">support@enchawet.et</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-200" />
                <span className="text-green-100 text-sm">+251 911 123 456</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-200 mt-0.5" />
                <span className="text-green-100 text-sm">Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-500 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-green-200 text-sm">© 2024 Enchawet Ethiopia. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-green-200 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-green-200 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-green-200 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
