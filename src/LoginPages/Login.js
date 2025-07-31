import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import logo from '../Components/Images/aablogo.png';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [adminUser, setAdminUser] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [userImage, setUserImage] = useState(null);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://backendaab.in/aabuilderDash/api/login', { email, password });
            const { username, userImage, position, email: userEmail, userRoles, id } = response.data;
            setUserId(id);
            console.log("ID: ",id);
            onLogin({
                username: username || '',
                userImage: userImage || '',
                position: position || '',
                email: userEmail || '',
                userRoles: userRoles || [],
                userId: id, 
            });
            navigate('');
        } catch (err) {
            console.error(err);
            setError('Please Enter Valid User Details');
        }
    };
    const refreshUserData = async () => {
        try {
            const response = await axios.get(`https://backendaab.in/aabuilderDash/api/user/id/${userId}`);
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
        const interval = setInterval(() => {
            refreshUserData(); // from above
        }, 10000); // every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (upload) => {
                const base64String = upload.target.result.split(',')[1];
                setUserImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('https://backendaab.in/aabuilderDash/api/sign-in', {
                username,
                email,
                password,
                position,
                userImage,
                adminUsername: adminUser,
                adminPassword,
            },{
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log(response.ok);
            onLogin({ username, userImage, position, email });
            navigate('');
        } catch (err) {
            console.error(err);
            setError('Error registering user');
        }
    };
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#FAF6ED] bg-center" >
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <div className='flex'>
                    <img src={logo}
                        alt="Logo"
                        className="cursor-pointer w-[50px] h-[50px] rounded-full ml-[7.5rem] -mt-2"
                    />
                    <h2 className="text-2xl font-extrabold mb-6 text-center">{isRegistering ? 'Register' : 'Login'}</h2>
                </div>
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-4 mb-4 text-red-600 bg-red-100 rounded">
                            {error}
                        </div>
                    )}
                    {isRegistering && (
                        <div>
                            <label htmlFor="adminUser" className="block text-base font-semibold -ml-[15.5rem]">
                                Admin User Name
                            </label>
                            <input
                                id="adminUserName"
                                type="text"
                                value={adminUser}
                                onChange={(e) => setAdminUser(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                placeholder='Enter Admin User Name'
                                required
                            />
                        </div>
                    )}
                    {isRegistering && (
                        <div>
                            <label htmlFor="adminPassword" className="block text-base font-semibold -ml-[16rem]">
                                Admin Password
                            </label>
                            <input
                                id="adminPassword"
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder='Enter Admin Password'
                            />
                        </div>
                    )}
                    {isRegistering && (
                        <div>
                            <label htmlFor="username" className="block text-base font-semibold -ml-[19rem]">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder='Enter User Name'
                            />
                        </div>
                    )}
                    {isRegistering && (
                        <div>
                            <label htmlFor="userImage" className="block text-base font-semibold -ml-[21rem]">
                                Profile
                            </label>
                            <input
                                id="userImage"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-base font-semibold -ml-[17rem]">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                            required
                            placeholder='Enter Email Address'
                        />
                    </div>
                    {isRegistering && (
                        <div>
                            <label htmlFor="username" className="block text-base font-semibold -ml-[20rem]">
                                Position
                            </label>
                            <input
                                id="position"
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder='Enter Position'
                            />
                        </div>
                    )}
                    <div className="relative">
                        <label htmlFor="password" className="block text-base font-semibold -ml-[19rem]">
                            Password
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                            required
                            placeholder='Enter Password'
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 mt-6" >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                    </div>
                    {isRegistering && (
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-base font-semibold -ml-[15rem]">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder='Enter Password Again'
                            />
                        </div>
                    )}
                    <button type="submit"
                        className="w-full text-sm px-4 py-2 bg-[#BF9853] text-white font-semibold rounded-md shadow-sm hover:bg-[#BF9853] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BF9853]"
                    >
                        {isRegistering ? 'REGISTER' : 'LOGIN'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-[#BF9853] hover:underline" >
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;