import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLandingPage from './MainLandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<MainLandingPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/account/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
