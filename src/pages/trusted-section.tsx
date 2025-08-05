import { Star } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"

export default function TrustedSection() {
  const testimonials = [
    {
      id: 1,
      text: "I asked a business expert about scaling my restaurant and got a detailed video response with actionable steps. The insights I received helped me avoid costly mistakes and grow my business by 40%.",
      author: "Almaz Tadesse",
      role: "Small Business Owner",
      avatar: "/placeholder.svg?height=50&width=50&text=AT",
    },
    {
      id: 2,
      text: "I submitted a complex coding question and received a thorough voice explanation with code examples. The expert's response was exactly what I needed to advance my career.",
      author: "Daniel Kebede",
      role: "Software Developer",
      avatar: "/placeholder.svg?height=50&width=50&text=DK",
    },
    {
      id: 3,
      text: "As a law student, I was able to ask detailed questions about Ethiopian legal procedures and received comprehensive chat responses from an experienced lawyer. Perfect for my studies!",
      author: "Sara Mohammed",
      role: "University Student",
      avatar: "/placeholder.svg?height=50&width=50&text=SM",
    },
  ]

  const trustIndicators = ["10,000+ Questions Answered", "Verified Expert Profiles", "Money-Back Guarantee"]

  return (
    <div className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from people who found the expert guidance they needed to succeed.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="text-4xl text-orange-400 mb-4 font-serif">"</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 italic mb-6 leading-relaxed">{testimonial.text}</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold text-sm">
                    {testimonial.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
          {trustIndicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium">{indicator}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
