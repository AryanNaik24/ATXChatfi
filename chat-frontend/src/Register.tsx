import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css';
import  logo from './assets/ATXLabsLogo.png'

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleRegister = () => {
        axios.post('http://127.0.0.1:8000/api/register/', {
            username,
            email,
            password
        })
        .then(response => {

            navigate('/login');
        })
        .catch(error => {
          console.error("Error registering:", error);
          if (error.response && error.response.data) {
              setError('Unable to register with provided details. Please try again.');
          } else {
              setError('Something went wrong. Please try again later.');
          }
        });
    };

    return (
<section className="bg-gray-50 dark:bg-customDarkGrey min-h-screen flex items-center justify-center">
  <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto w-full sm:max-w-lg md:max-w-lg lg:max-w-xl md:h-auto">
    <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
      {/* Task : Add company logo later */}
      
      <img className="w-full dark:bg-transparent h-8 mr-2" src={logo} alt="logo" />
    </a>
    <div className="w-full bg-white rounded-lg shadow dark:border dark:border-gray-700 dark:bg-customLightGrey">
      <div className="p-6 space-y-4 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          Create your account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Username Input */}
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-customDarkGrey dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Email Input */}
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-customDarkGrey dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-customDarkGrey dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Register Button */}
        <button className="w-full text-white bg-customGreen hover:bg-customGreen hover:text-grey-800 focus:ring-1 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-customGreen dark:hover:bg-customLightGreen  dark:focus:ring-green-800" onClick={handleRegister}>
          Register
        </button>

        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Already have an account? <a href="/login" className="font-medium text-customGreen hover:underline dark:hover:text-customLightGreen  dark:text-customGreen">Login</a>
        </p>
      </div>
    </div>
  </div>
</section>


    );
};

export default Register;
