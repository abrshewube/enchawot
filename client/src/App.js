import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ExpertsList from './pages/experts/ExpertsList';
import ExpertProfile from './pages/experts/ExpertProfile';
import AskQuestion from './pages/questions/AskQuestion';
import MyQuestions from './pages/questions/MyQuestions';
import QuestionDetails from './pages/questions/QuestionDetails';
import Wallet from './pages/wallet/Wallet';
import Referrals from './pages/referrals/Referrals';
import Profile from './pages/profile/Profile';
import Notifications from './pages/notifications/Notifications';

// Expert Pages
import ExpertDashboard from './pages/expert/Dashboard';
import ExpertProfile as ExpertProfilePage from './pages/expert/Profile';
import ExpertQuestions from './pages/expert/Questions';
import ExpertEarnings from './pages/expert/Earnings';

// Protected Route Component
const ProtectedRoute = ({ children, expertOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (expertOnly && user.role !== 'expert') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/experts" element={<ExpertsList />} />
            <Route path="/experts/:id" element={<ExpertProfile />} />

            {/* Protected User Routes */}
            <Route path="/ask-question/:expertId" element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            } />
            <Route path="/my-questions" element={
              <ProtectedRoute>
                <MyQuestions />
              </ProtectedRoute>
            } />
            <Route path="/questions/:id" element={
              <ProtectedRoute>
                <QuestionDetails />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/referrals" element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />

            {/* Expert Routes */}
            <Route path="/expert/dashboard" element={
              <ProtectedRoute expertOnly>
                <ExpertDashboard />
              </ProtectedRoute>
            } />
            <Route path="/expert/profile" element={
              <ProtectedRoute expertOnly>
                <ExpertProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/expert/questions" element={
              <ProtectedRoute expertOnly>
                <ExpertQuestions />
              </ProtectedRoute>
            } />
            <Route path="/expert/earnings" element={
              <ProtectedRoute expertOnly>
                <ExpertEarnings />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;