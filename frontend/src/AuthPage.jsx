import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!userName.trim()) {
      setErrorMessage('Please enter your username');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: userName,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Login Failed');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('loggedInUser', JSON.stringify(data.user));
      setSuccessMessage('Login Successful');
      navigate('/Dashboard', {
        state: {
          userName: data.user.username,
        },
      });

      setUserName('');
      setPassword('');
    } catch (error) {
      console.log(error);
      setErrorMessage('Unable to connect to server. Please try again later.');
    }
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !userName.trim() || !password.trim() || !email.trim() || !mobile.trim()) {
      setErrorMessage('Please fill in all the fields');
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage('Password should contain at least one numeric digit, one special character, and have a minimum length of 6 characters');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            username: userName,
            email,
            mobile,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Registration failed');
        return;
      }

      setSuccessMessage('Registration successful! Please login.');
      setName('');
      setUserName('');
      setPassword('');
      setEmail('');
      setMobile('');
      setIsSignUp(false);
    } catch (error) {
      console.log(error);
      setErrorMessage('Unable to connect to server. Please try again later.');
    }
  };

  const handleSignIn = () => {
    setIsSignUp(false);
    setErrorMessage('');
    setSuccessMessage('');
    setUserName('');
    setPassword('');
    setEmail('');
    setMobile('');
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <span className="text-xl font-bold tracking-tighter">B</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Bussiness ERP</span>
          </div>

          <h1 className="text-4xl font-semibold mb-6 leading-tight tracking-tight">
            Streamline your<br />business operations.
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-md font-light leading-relaxed">
            A complete ERP solution designed to help modern enterprises scale effortlessly with powerful analytics and seamless inventory control.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">✓</div>
              <span className="text-sm font-medium">Real-time Inventory Tracking</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">✓</div>
              <span className="text-sm font-medium">Advanced Sales Analytics</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center border border-slate-700">✓</div>
              <span className="text-sm font-medium">Supplier & Vendor Management</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <p className="text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Nexora Systems Inc.
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nexora ERP</h1>
          </div>
          {isSignUp ? (
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Create Account</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="johndoe" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No <span className="text-red-500">*</span></label>
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="+1 234 567 890" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="••••••••" required />
                </div>
                <button onClick={handleSignUp} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors mt-6">Register</button>
                <p className="text-center text-sm text-gray-600 mt-4">Already have an account? <span className="text-primary-600 font-medium cursor-pointer hover:underline" onClick={handleSignIn}>Sign In</span></p>
              </div>
              {errorMessage && <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">{errorMessage}</div>}
              {successMessage && <div className="mt-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg">{successMessage}</div>}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">Welcome Back</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="Enter your username" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors outline-none" placeholder="••••••••" required />
                </div>
                <div className="flex justify-end pt-1">
                  <span className="text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer transition-colors" onClick={() => navigate('/Forgetpass')}>Forgot Password?</span>
                </div>
                <button onClick={handleLogin} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors mt-4">Sign In</button>
                <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">Don't have an account? <span className="text-primary-600 font-medium cursor-pointer hover:underline ml-1" onClick={() => setIsSignUp(true)}>Sign Up</span></p>
              </div>
              {errorMessage && <div className="mt-6 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">{errorMessage}</div>}
              {successMessage && <div className="mt-6 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg">{successMessage}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;