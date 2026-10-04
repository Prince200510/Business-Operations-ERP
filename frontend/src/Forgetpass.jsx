import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Forgetpass = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const back = () => navigate('/');

    const handleSendOTP = async () => {
        if (!username) {
            Swal.fire({ title: 'Error', text: 'Please enter your username or email', icon: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({ title: 'OTP Sent', text: 'Please check your email', icon: 'success' });
                setStep(2);
                setCooldown(60);
            } else {
                Swal.fire({ title: 'Error', text: data.detail || 'Failed to send OTP', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            Swal.fire({ title: 'Error', text: 'Please enter the OTP', icon: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, otp })
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({ title: 'Verified', text: 'OTP verified successfully', icon: 'success' });
                setStep(3);
            } else {
                Swal.fire({ title: 'Error', text: data.detail || 'Invalid OTP', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            Swal.fire({ title: 'Invalid Password', text: 'At least 8 chars, 1 number, 1 special char required', icon: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, otp, new_password: newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({ title: 'Success', text: 'Password reset successfully', icon: 'success' });
                navigate('/');
            } else {
                Swal.fire({ title: 'Error', text: data.detail || 'Failed to reset password', icon: 'error' });
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Server error', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                        {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 1 ? 'Enter your username or email to receive an OTP.' : 
                         step === 2 ? 'Enter the 6-digit OTP sent to your email.' : 
                         'Create a new strong password.'}
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {step === 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username or Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Enter username or email"
                            />
                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">6-Digit OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Enter OTP"
                            />
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <div className="text-center mt-4 text-sm">
                                <button
                                    onClick={handleSendOTP}
                                    disabled={cooldown > 0 || loading}
                                    className={`font-medium ${cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500'}`}
                                >
                                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="Enter new password"
                            />
                            <button
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <button
                            onClick={back}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forgetpass;