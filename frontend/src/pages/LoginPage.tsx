import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '../Context/AuthContext';
import '../App.css';
import '../styles/auth.css';
import '../styles/validation.css';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { type LoginPayload } from '../models/Auth';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export default function LoginPage() {

  const {loginUser} = useAuth();
  const {register,handleSubmit, formState: {errors}} = useForm<LoginPayload>({resolver: yupResolver(validationSchema)});

  const navigate = useNavigate();

  const handleLogin = (form: LoginPayload) => {
    loginUser(form);
  }

  return (
    <div className='auth-container'>
      <h2 className="animate-up">Login Page</h2>
      <form className='auth-form animate-up delay-1' onSubmit={handleSubmit(handleLogin)}>
        <div className='email-div'>
          <label htmlFor="email">Email:</label>
          <input type="email" 
          id="email" 
          {...register("email")}
          required/>
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div className='password-div'>
          <label htmlFor="password">Password:</label>
          <input type="password" 
          id="password" 
          {...register("password")}
          required />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <button type="submit">Login</button>
      </form>

    <div className="animate-up delay-2">
      <p>Don't have account? <span className='auth-register-link' onClick={() => navigate('/register')}>Register here.</span></p>
    </div>

    </div>
  )
}