import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '../Context/AuthContext';
import '../App.css';
import '../styles/auth.css';
import '../styles/validation.css';

import { useForm } from 'react-hook-form';
import { type RegisterPayload } from '../models/Auth';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPass: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export default function RegisterPage() {

  const {registerUser} = useAuth();
  const {register,handleSubmit, formState: {errors}} = useForm<RegisterPayload>({resolver: yupResolver(validationSchema)});

  return (
    <div className='auth-container'>
      <h2 className="animate-up">Register Page</h2>
      <form className='auth-form animate-up delay-1' onSubmit={handleSubmit(registerUser)}>
        <div className='name-div'>
          <label htmlFor="name">Name:</label>
          <input type="text" 
          id="name" 
          {...register("name")}
          required/>
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
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
        <div className='password-div'>
          <label htmlFor="confirmPass">Confirm Password:</label>
          <input type="password" 
          id="confirmPass" 
          {...register("confirmPass")}
          required />
          {errors.confirmPass && <p className="field-error">{errors.confirmPass.message}</p>}
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  )
}