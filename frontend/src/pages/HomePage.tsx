import '../App.css';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
      <div className="app-container">
      <div className="greeting-container">
        
        {!user ? (
          <p>Hello and Welcome to the AI Finance Assistant app!</p>
        ) : (
          <><p>Welcome, {user.name}! Let's discuss Your finance.</p>
            <p>Go to the <span className='dashboard-link' onClick={() => navigate('/dashboard')}>Dashboard</span></p>
          </>
        )}
          
      
      
      </div>
    </div>
  )
}