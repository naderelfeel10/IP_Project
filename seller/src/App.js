import { useState } from 'react';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import API from './api';

function App() {
  const savedUser = localStorage.getItem('sellerUser');
  const [page, setPage] = useState(savedUser ? 'dashboard' : 'signin');
  const [seller, setSeller] = useState(savedUser ? JSON.parse(savedUser) : null);

  const handleLogin = (token, user) => {
    localStorage.setItem('sellerToken', token);
    localStorage.setItem('sellerUser', JSON.stringify(user));
    setSeller(user);
    setPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.log(error.message);
    }

    localStorage.removeItem('sellerToken');
    localStorage.removeItem('sellerUser');
    setSeller(null);
    setPage('signin');
  };

  return (
    <div>
      {page === 'dashboard' && seller && (
        <Dashboard seller={seller} onLogout={handleLogout} />
      )}

      {page === 'signin' && (
        <SignIn
          onLogin={handleLogin}
          onSwitchToSignUp={() => setPage('signup')}
        />
      )}

      {page === 'signup' && (
        <SignUp onSwitchToSignIn={() => setPage('signin')} />
      )}
    </div>
  );
}

export default App;
