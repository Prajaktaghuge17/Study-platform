import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { useMutation } from '@tanstack/react-query';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import "./Register.css"

interface RegisterUserParams {
    email: string;
    password: string;
}

const registerUser = async ({ email, password }: RegisterUserParams) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
};

const Registration: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            alert('Account Created Successfully. Please log in.');
            navigate('/login');
        },
        onError: (error) => {
            console.error('Error registering:', error);
            alert('Failed to create account. Please try again.');
        },
    });

    const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutation.mutate({ email, password });
    };

    return (
        <div className="router-body">
            <form className="router-inn-body" onSubmit={handleRegister} >
                <div className="row">
                    <h2>Register</h2>
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
                            <div className="col-3 ">
                                <div className='d-grid'>
                                    <button type='submit' className=' btn btn-primary ' > Register</button>

                                </div>
                            </div>

                        </div>

                        <p className='mt-3'>
                            Already have an account? <Link to='/login'>Login</Link>
                        </p>
                    
            </form>
        </div>


    );
};

export default Registration;
