import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLandingPage from './MainLandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ResetPasswordPage from './ResetPasswordPage';
import Collections from './Collections';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<MainLandingPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/account/register" element={<RegisterPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/collections/:tea-type" element={<Collections />} />
      </Routes>
    </Router>
  );
}

export default App;
