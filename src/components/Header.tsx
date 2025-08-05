import { Button } from "../components/ui/button"


export default function LandingPage() {
  return (
    <div
      className="min-h-screen w-full relative bg-cover bg-center bg-no-repeat"
      style={{
       backgroundImage: "url('/assets/home/enchawot_landing.png')",
      }}
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 z-10">
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 border-2 border-dotted border-white/60 rounded-full">
          <span className="text-white text-2xl font-bold">E</span>
        </div>

        {/* Login/Register */}
        <div className="text-white/80 font-medium tracking-wider">LOGIN | REGISTER</div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider mb-2">ENCHAWET</h1>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/90 tracking-wider">ETHIOPIA</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6">
          <Button
            className="bg-green-600/80 hover:bg-green-700/80 text-white border-0 px-8 py-3 rounded-full text-lg font-medium tracking-wide backdrop-blur-sm transition-all duration-300"
            size="lg"
          >
            START EARNING
          </Button>
          <Button
            className="bg-green-600/80 hover:bg-green-700/80 text-white border-0 px-8 py-3 rounded-full text-lg font-medium tracking-wide backdrop-blur-sm transition-all duration-300"
            size="lg"
          >
            ASK A QUESTION
          </Button>
        </div>
      </div>
    </div>
  )
}
