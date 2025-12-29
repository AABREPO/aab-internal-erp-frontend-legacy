import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const LoginPage = ({ 
    onLogin, 
    redirectPath = '/purchase-order', // Configurable redirect path after login
    apiBaseUrl = 'https://backendaab.in/aabuilderDash/api', // Configurable API base URL
    logo = null // Optional logo image
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [userId, setUserId] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiBaseUrl}/login`, { email, password });
            const { username, userImage, position, email: userEmail, userRoles, id } = response.data;

            setUserId(id);
            console.log("ID: ", id);

            const userData = {
                username: username || '',
                userImage: userImage || '',
                position: position || '',
                email: userEmail || '',
                userRoles: userRoles || [],
                userId: id,
            };

            onLogin(userData);

            // Navigate to redirect path if provided
            if (redirectPath) {
                navigate(redirectPath);
            }
        } catch (err) {
            console.error(err);
            setError('Please Enter Valid User Details');
        }
    };

    const refreshUserData = async () => {
        if (!userId) return;
        
        try {
            const response = await axios.get(`${apiBaseUrl}/user/id/${userId}`);
            const { username, userImage, position, email: userEmail, userRoles } = response.data;

            console.log("Refreshing!!!!");
            onLogin({
                username: username || '',
                userImage: userImage || '',
                position: position || '',
                email: userEmail || '',
                userRoles: userRoles || [],
            });
        } catch (err) {
            console.error('Failed to refresh user data', err);
        }
    };

    useEffect(() => {
        if (!userId) return;
        
        const interval = setInterval(() => {
            refreshUserData();
        }, 10000); // every 10 seconds

        return () => clearInterval(interval);
    }, [userId]);


    return (
        <div className="relative flex items-center justify-center min-h-screen bg-white" style={{ fontFamily: "'Manrope', sans-serif" }}>
            {/* Black sidebars */}
            <div className="hidden md:block fixed left-0 top-0 w-[calc((100%-800px)/2)] h-full bg-black"></div>
            <div className="hidden md:block fixed right-0 top-0 w-[calc((100%-800px)/2)] h-full bg-black"></div>
            
            {/* Main content area */}
            <div className="w-full max-w-[800px] mx-auto px-4">
                <div className="bg-white rounded-[12px] p-8 shadow-lg border border-gray-200">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-black text-center mb-6">
                        Login
                    </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-[8px] border border-red-200 text-[14px] font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-base font-bold text-black mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-[44px] px-4 border border-gray-300 rounded-[8px] text-[14px] font-medium text-black placeholder:text-gray-400 focus:outline-none focus:border-black bg-white"
                            required
                            placeholder='Enter Email Address'
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-base font-bold text-black mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-[44px] px-4 pr-12 border border-gray-300 rounded-[8px] text-[14px] font-medium text-black placeholder:text-gray-400 focus:outline-none focus:border-black bg-white"
                            required
                            placeholder='Enter Password'
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-[38px] flex items-center"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>

                    <button 
                        type="submit"
                        className="w-full h-[44px] bg-black text-white font-semibold rounded-[8px] text-[14px] uppercase hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
                    >
                        LOGIN
                    </button>
                </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

