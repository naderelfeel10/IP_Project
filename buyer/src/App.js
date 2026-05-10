import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { getAuthPayload, isSignedIn } from './auth';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminUserProfilePage from './pages/AdminUserProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import LandingPage from './pages/LandingPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SellerProfilePage from './pages/SellerProfilePage';
import UserProfilePage from './pages/UserProfilePage';

function SignInRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  return <SignIn onSignedIn={() => navigate(redirectTo, { replace: true })} onSwitchToSignUp={() => navigate('/signup')} />;
}

function SignUpRoute() {
  const navigate = useNavigate();

  return <SignUp onSwitchToSignIn={() => navigate('/signin')} />;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();

  if(!isSignedIn()){
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if(adminOnly && getAuthPayload()?.type !== 'admin'){
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
          <Route path="/products/:productId" element={<ProtectedRoute><ProductDetailsPage /></ProtectedRoute>} />
          <Route path="/seller/:sellerId" element={<ProtectedRoute><SellerProfilePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/users/:role/:userId" element={<ProtectedRoute adminOnly><AdminUserProfilePage /></ProtectedRoute>} />
          <Route path="/signin" element={<SignInRoute />} />
          <Route path="/signup" element={<SignUpRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
