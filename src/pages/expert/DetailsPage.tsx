import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

import { Star, Clock, Check, MessageCircle, Phone, Video, MapPin, Award, Users } from "lucide-react"

export default function ExpertDetails() {
  const expert = {
    name: "Dr. Meseret Alemu",
    title: "Business Strategy Consultant",
    category: "Business & Finance",
    rating: 4.9,
    reviews: 156,
    responseTime: "2-4 hours",
    location: "Addis Ababa, Ethiopia",
    experience: "8+ years",
    questionsAnswered: 1240,
    avatar: "/placeholder.svg?height=120&width=120&text=MA",
    bio: "I'm a seasoned business strategist with over 8 years of experience helping startups and established businesses scale effectively. I specialize in market analysis, financial planning, and operational optimization. My approach combines data-driven insights with practical implementation strategies.",
    expertise: [
      "Startup Strategy",
      "Market Analysis",
      "Financial Planning",
      "Business Development",
      "Operations Management",
      "Investment Planning",
    ],
    languages: ["English", "Amharic", "Tigrinya"],
    education: [
      "MBA in Business Administration - Addis Ababa University",
      "BSc in Economics - Ethiopian Civil Service University",
    ],
    certifications: ["Certified Business Analyst (CBA)", "Project Management Professional (PMP)"],
  }

  const services = [
    {
      type: "Chat Response",
      icon: MessageCircle,
      price: "250 ETB",
      description: "Get detailed written responses to your questions",
      deliveryTime: "2-4 hours",
      features: ["Detailed written analysis", "Follow-up questions included", "Resource recommendations"],
    },
    {
      type: "Voice Response",
      icon: Phone,
      price: "450 ETB",
      description: "Receive personalized voice explanations",
      deliveryTime: "4-6 hours",
      features: ["10-15 minute voice recording", "Personal insights", "Action plan included"],
    },
    {
      type: "Video Consultation",
      icon: Video,
      price: "750 ETB",
      description: "One-on-one video consultation session",
      deliveryTime: "Schedule required",
      features: ["30-minute live session", "Screen sharing available", "Recording provided"],
    },
  ]

  const recentReviews = [
    {
      id: 1,
      author: "Almaz Tadesse",
      role: "Restaurant Owner",
      rating: 5,
      date: "2 days ago",
      comment:
        "Dr. Meseret provided excellent guidance on scaling my restaurant business. Her detailed analysis helped me identify key growth opportunities and avoid costly mistakes.",
      avatar: "/placeholder.svg?height=40&width=40&text=AT",
    },
    {
      id: 2,
      author: "Dawit Bekele",
      role: "Tech Startup Founder",
      rating: 5,
      date: "1 week ago",
      comment:
        "Outstanding market analysis and strategic recommendations. The voice response was incredibly detailed and actionable. Highly recommend!",
      avatar: "/placeholder.svg?height=40&width=40&text=DB",
    },
    {
      id: 3,
      author: "Hanan Ahmed",
      role: "Small Business Owner",
      rating: 4,
      date: "2 weeks ago",
      comment:
        "Great insights on financial planning. The consultation helped me restructure my business finances and plan for expansion.",
      avatar: "/placeholder.svg?height=40&width=40&text=HA",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>Home</span>
            <span>/</span>
            <span>Experts</span>
            <span>/</span>
            <span className="text-gray-900">Dr. Meseret Alemu</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Expert Profile Card */}
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-semibold">
                      {expert.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
                        <p className="text-lg text-gray-600 mb-3">{expert.title}</p>
                        <Badge className="bg-green-700 text-white">{expert.category}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{expert.rating}</span>
                        <span className="text-gray-500 text-sm">({expert.reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{expert.responseTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{expert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{expert.experience}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Pricing</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <service.icon className="w-6 h-6 text-green-600" />
                        <h3 className="font-semibold text-gray-900">{service.type}</h3>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">{service.price}</div>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{service.deliveryTime}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check className="w-3 h-3 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-green-600 hover:bg-green-700">Select {service.type}</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expertise & Skills */}
            <Card className="bg-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Expertise & Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {expert.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
                  <Button variant="outline" className="border-green-600 text-green-600 bg-transparent">
                    View All Reviews
                  </Button>
                </div>
                <div className="space-y-6">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold text-sm">
                          {review.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{review.author}</h4>
                            <span className="text-sm text-gray-500">{review.role}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Questions Answered</span>
                    </div>
                    <span className="font-semibold text-gray-900">{expert.questionsAnswered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Average Rating</span>
                    </div>
                    <span className="font-semibold text-gray-900">{expert.rating}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Response Time</span>
                    </div>
                    <span className="font-semibold text-gray-900">{expert.responseTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {expert.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="border-gray-300">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Education</h3>
                <div className="space-y-3">
                  {expert.education.map((edu, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {edu}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-3">
                  {expert.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Expert */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ready to get expert advice?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose your preferred communication method and get personalized guidance.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 mb-3">Ask a Question</Button>
                <Button variant="outline" className="w-full border-green-600 text-green-600 bg-transparent">
                  Schedule Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
