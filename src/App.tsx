// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HowItWorks from './components/HowItWorks';
import ExpertCategories from './components/ExpertCategories';
import CTASection from './components/CTASection';
import ExpertsPage from './pages/ExpertsPage';
import Footer from './components/footer';
import TrustedSection from './pages/trusted-section';
import ExpertDetails from './pages/expert/DetailsPage';

const HomePage = () => (
  <>
    <Header />
    <HowItWorks />
    <ExpertCategories />
    <CTASection />
    <ExpertsPage />
    <TrustedSection />
    <Footer />
  </>
);

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experts" element={<ExpertsPage />} />
        <Route path="/experts/1" element={<ExpertDetails />} />
      </Routes>
    </div>
  );
}

export default App;
