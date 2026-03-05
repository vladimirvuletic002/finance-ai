import './App.css'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import { AuthProvider } from './Context/AuthContext';
import NavbarX from './components/NavbarX';
import Sidebar from './components/Sidebar';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';

function App() {

  return (
      <Router>
        <AuthProvider>

        <div className="app-layout">
        <NavbarX />

        <Sidebar />

        <main>
        <ToastContainer />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
        </div>
          </AuthProvider>
        </Router>

  )
}

export default App
