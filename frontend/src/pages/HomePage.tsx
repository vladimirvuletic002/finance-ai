import '../App.css';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
      <div className="app-container">
      <div className="greeting-container animate-up">
        
        {!user ? (
          <p>Hello and Welcome to the AI Finance Assistant app!</p>
        ) : (
          <><p>Greetings, <span className='username-bold'>{user.name}</span></p>
            <p>Let's discuss Your finance.</p>
            <p>Go to the <span className='dashboard-link' onClick={() => navigate('/dashboard')}>Dashboard</span></p>
          </>
        )}
          
      
      
      </div>
    </div>
  )
}