import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { useMutation } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth';
import "./Register.css"

interface LoginUserParams {
  email: string;
  password: string;
}

const loginUser = async ({ email, password }: LoginUserParams) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      alert('Login Successfully');
      navigate('/');
    },
    onError: (error: any) => {
      console.error('Error logging in:', error);
      alert('Invalid credentials. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="router-body">
      <form className="router-inn-body" onSubmit={handleSubmit}>
        <div className="row">
          <h2>Login</h2>
          <div className='col md-3'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              className='form-control'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className='col md-3'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              className='form-control'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='row'>
          <div className="col-3">
            <div className='d-grid'>
              <button type='submit' className='btn btn-primary'>Login</button>
            </div>
          </div>
        </div>
        <p className='mt-3'>
          Don't have an account? <Link to='/register'>Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
