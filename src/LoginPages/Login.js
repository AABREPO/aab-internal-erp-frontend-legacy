import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import logo from '../Components/Images/aablogo.png';

const API_BASE_URL = 'https://backendaab.in/aabuilderDash/api';
const BRANCH_API_URL = 'https://backendaab.in/aabuildersDash/api/branch/getAll';
const FILE_UPLOAD_URL = 'https://backendaab.in/aabuildersDash/api/files/upload';

const LoginPage = ({ onLogin }) => {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [userImageUrl, setUserImageUrl] = useState('');
    const [selectedProfileImage, setSelectedProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [userId, setUserId] = useState('');
    const [branchOptions, setBranchOptions] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [registrationOtpSent, setRegistrationOtpSent] = useState(false);
    const [forgotOtpSent, setForgotOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const authTitle = {
        login: 'Login',
        register: 'Register',
        forgot: 'Forgot Password',
    }[mode];

    const getApiErrorMessage = (err, fallback) => {
        return err?.response?.data?.message || err?.response?.data || fallback;
    };

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        setPassword('');
        setConfirmPassword('');
        setResetPassword('');
        setResetConfirmPassword('');
        setOtp('');
        setRegistrationOtpSent(false);
        setForgotOtpSent(false);
        resetMessages();
    };

    const buildProfileImageFileName = () => {
        const timestamp = new Date()
            .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            })
            .replace(',', '')
            .replace(/\s/g, '-');
        const safeName = (username || email || 'user')
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        return `${timestamp}_${safeName}_profile`;
    };

    const uploadProfileImage = async () => {
        if (!selectedProfileImage) {
            return userImageUrl;
        }

        const formData = new FormData();
        formData.append('files', selectedProfileImage);
        formData.append('folder', 'FileUpload / User_Profile_Images');
        formData.append('fileName', buildProfileImageFileName());

        const uploadResponse = await fetch(FILE_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Profile image upload failed');
        }

        const result = await uploadResponse.json();
        const uploadedUrl = result?.urls?.[0];
        if (!uploadedUrl) {
            throw new Error('Profile image upload did not return a URL');
        }

        setUserImageUrl(uploadedUrl);
        return uploadedUrl;
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setSelectedProfileImage(null);
            setProfileImagePreview('');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            setSelectedProfileImage(null);
            setProfileImagePreview('');
            return;
        }

        setSelectedProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
        resetMessages();
    };

    const normalizeAndLoginUser = (loggedInUser, token) => {
        const {
            username: userName,
            userImage,
            userImageUrl: imageUrl,
            position: userPosition,
            email: userEmail,
            userRoles,
            id,
            branch_id,
            branchId,
            brachId,
        } = loggedInUser;

        const resolvedBranchId = branch_id ?? branchId ?? brachId ?? '';
        const resolvedUserImage = imageUrl || userImage || '';

        if (token) {
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }

        setUserId(id);
        onLogin({
            username: userName || '',
            userImage: resolvedUserImage,
            userImageUrl: resolvedUserImage,
            position: userPosition || '',
            email: userEmail || '',
            userRoles: userRoles || [],
            userId: id,
            branchId: resolvedBranchId,
            brachId: resolvedBranchId,
            superAdmin: !!loggedInUser.superAdmin,
            canCreateUsers: !!loggedInUser.canCreateUsers,
        });
        navigate('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        resetMessages();
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            normalizeAndLoginUser(response.data?.user || {}, response.data?.access_token);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Please enter valid user details'));
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = async () => {
        if (!userId) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/user/id/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const {
                username: refreshedUsername,
                userImage,
                userImageUrl: refreshedImageUrl,
                position: refreshedPosition,
                email: userEmail,
                userRoles,
                branch_id,
                branchId,
                brachId,
            } = response.data;
            const resolvedBranchId = branch_id ?? branchId ?? brachId ?? '';
            const resolvedUserImage = refreshedImageUrl || userImage || '';
            onLogin({
                username: refreshedUsername || '',
                userImage: resolvedUserImage,
                userImageUrl: resolvedUserImage,
                position: refreshedPosition || '',
                email: userEmail || '',
                userRoles: userRoles || [],
                userId,
                branchId: resolvedBranchId,
                brachId: resolvedBranchId,
            });
        } catch (err) {
            console.error('Failed to refresh user data', err);
        }
    };

    useEffect(() => {
        if (!userId) return undefined;
        const interval = setInterval(refreshUserData, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await axios.get(BRANCH_API_URL, { withCredentials: true });
                const branches = Array.isArray(response.data) ? response.data : [];
                setBranchOptions(branches);
            } catch (err) {
                console.error('Failed to load branches', err);
            }
        };
        fetchBranches();
    }, []);

    const requestRegistrationOtp = async () => {
        resetMessages();
        if (!email) {
            setError('Please enter email address');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/register/request-otp`, { email });
            setRegistrationOtpSent(true);
            setSuccess('OTP sent to your email for verification');
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Unable to send OTP'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        resetMessages();

        if (!registrationOtpSent) {
            await requestRegistrationOtp();
            return;
        }
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const uploadedProfileImageUrl = await uploadProfileImage();
            await axios.post(`${API_BASE_URL}/auth/register`, {
                email,
                otp,
                username,
                password,
                userImageUrl: uploadedProfileImageUrl,
                position,
                branchId: selectedBranchId ? Number(selectedBranchId) : null,
            });
            setSuccess('Registration completed. Please login with your email and password.');
            setMode('login');
            setOtp('');
            setPassword('');
            setConfirmPassword('');
            setRegistrationOtpSent(false);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Error registering user'));
        } finally {
            setLoading(false);
        }
    };

    const requestForgotPasswordOtp = async () => {
        resetMessages();
        if (!email) {
            setError('Please enter email address');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password/request-otp`, { email });
            setForgotOtpSent(true);
            setSuccess('OTP sent to your email to reset password');
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Unable to send password reset OTP'));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        resetMessages();

        if (!forgotOtpSent) {
            await requestForgotPasswordOtp();
            return;
        }
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
        if (resetPassword !== resetConfirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/forgot-password/reset`, {
                email,
                otp,
                newPassword: resetPassword,
            });
            setSuccess('Password updated successfully. Please login with your new password.');
            setMode('login');
            setOtp('');
            setResetPassword('');
            setResetConfirmPassword('');
            setForgotOtpSent(false);
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Unable to reset password'));
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async (purpose) => {
        resetMessages();
        if (!email) {
            setError('Please enter email address');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/resend-otp`, { email, purpose });
            setSuccess('OTP resent to your email');
        } catch (err) {
            console.error(err);
            setError(getApiErrorMessage(err, 'Unable to resend OTP'));
        } finally {
            setLoading(false);
        }
    };

    const renderEmailInput = () => (
        <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                required
                placeholder="Enter Email Address"
            />
        </div>
    );

    const renderPasswordInput = (value, onChange, label = 'Password', show = showPassword, toggle = setShowPassword) => (
        <div className="relative">
            <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="block text-sm font-semibold text-gray-700">
                {label}
            </label>
            <input
                id={label.replace(/\s+/g, '-').toLowerCase()}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                required
                placeholder={label}
            />
            <button type="button" onClick={() => toggle(!show)} className="absolute inset-y-0 right-0 flex items-center px-3 mt-6">
                {show ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
            </button>
        </div>
    );

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#FAF6ED] bg-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <img src={logo} alt="Logo" className="cursor-pointer w-[50px] h-[50px] rounded-full" />
                    <h2 className="text-2xl font-extrabold text-center">{authTitle}</h2>
                </div>

                {error && <div className="p-4 mb-4 text-red-600 bg-red-100 rounded">{error}</div>}
                {success && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded">{success}</div>}

                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        {renderEmailInput()}
                        {renderPasswordInput(password, (e) => setPassword(e.target.value))}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-sm px-4 py-2 bg-[#BF9853] text-white font-semibold rounded-md shadow-sm disabled:opacity-60"
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                        </button>
                    </form>
                )}

                {mode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        {renderEmailInput()}

                        {registrationOtpSent && (
                            <div>
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                                    OTP
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                    required
                                    placeholder="Enter OTP"
                                />
                                <button
                                    type="button"
                                    onClick={() => resendOtp('REGISTRATION')}
                                    className="mt-2 text-sm text-[#BF9853] hover:underline"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder="Enter User Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="profileImage" className="block text-sm font-semibold text-gray-700">
                                Profile Image
                            </label>
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                            />
                            {profileImagePreview && (
                                <div className="mt-2 flex items-center gap-3">
                                    <img
                                        src={profileImagePreview}
                                        alt="Profile preview"
                                        className="w-12 h-12 rounded-full object-cover border"
                                    />
                                    <span className="text-xs text-gray-500">
                                        This image will upload when you create the account.
                                    </span>
                                </div>
                            )}
                            {userImageUrl && !selectedProfileImage && (
                                <p className="mt-1 text-xs text-green-700">Profile image uploaded.</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="position" className="block text-sm font-semibold text-gray-700">
                                Position
                            </label>
                            <input
                                id="position"
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                required
                                placeholder="Enter Position"
                            />
                        </div>

                        <div>
                            <label htmlFor="branchId" className="block text-sm font-semibold text-gray-700">
                                Branch
                            </label>
                            <select
                                id="branchId"
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm bg-white"
                                required
                            >
                                <option value="">Select Branch</option>
                                {branchOptions.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {renderPasswordInput(password, (e) => setPassword(e.target.value))}
                        {renderPasswordInput(confirmPassword, (e) => setConfirmPassword(e.target.value), 'Confirm Password')}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-sm px-4 py-2 bg-[#BF9853] text-white font-semibold rounded-md shadow-sm disabled:opacity-60"
                        >
                            {loading ? 'PLEASE WAIT...' : registrationOtpSent ? 'CREATE ACCOUNT' : 'SEND OTP'}
                        </button>
                    </form>
                )}

                {mode === 'forgot' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        {renderEmailInput()}

                        {forgotOtpSent && (
                            <>
                                <div>
                                    <label htmlFor="forgotOtp" className="block text-sm font-semibold text-gray-700">
                                        OTP
                                    </label>
                                    <input
                                        id="forgotOtp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-[#FAF6ED] border-r-[0.20rem] border-l-[0.20rem] border-b-[0.20rem] border-t-[0.20rem] rounded-md shadow-sm focus:outline-none focus:ring-[#BF9853] focus:border-[#BF9853] sm:text-sm"
                                        required
                                        placeholder="Enter OTP"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => resendOtp('PASSWORD_RESET')}
                                        className="mt-2 text-sm text-[#BF9853] hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                                {renderPasswordInput(resetPassword, (e) => setResetPassword(e.target.value), 'New Password', showResetPassword, setShowResetPassword)}
                                {renderPasswordInput(resetConfirmPassword, (e) => setResetConfirmPassword(e.target.value), 'Confirm New Password', showResetPassword, setShowResetPassword)}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-sm px-4 py-2 bg-[#BF9853] text-white font-semibold rounded-md shadow-sm disabled:opacity-60"
                        >
                            {loading ? 'PLEASE WAIT...' : forgotOtpSent ? 'RESET PASSWORD' : 'SEND RESET OTP'}
                        </button>
                    </form>
                )}

                <div className="mt-4 flex flex-col items-center gap-2 text-center">
                    {mode !== 'login' && (
                        <button onClick={() => switchMode('login')} className="text-sm text-[#BF9853] hover:underline">
                            Already have an account? Login
                        </button>
                    )}
                    {mode !== 'forgot' && (
                        <button onClick={() => switchMode('forgot')} className="text-sm text-[#BF9853] hover:underline">
                            Forgot Password?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;