import { useState } from 'react';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function App() {
  const [page, setPage] = useState('signup');

  return (
    <div className="App">
      {page === 'signup' 
        ? <SignUp onSwitchToSignIn={() => setPage('signin')} />
        : <SignIn onSwitchToSignUp={() => setPage('signup')} />
      }
    </div>
  );
}

export default App;