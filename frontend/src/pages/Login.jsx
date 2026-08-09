import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginWithGoogle } from '../services/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await loginUser(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged in with Google!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-mentorBlue-50/80 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-mentorBlue-200/20 blur-[100px] -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-mentorBlue-600 to-mentorBlue-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-1">Sign in to continue to MentorX</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400 focus:ring-1 focus:ring-mentorBlue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:border-mentorBlue-400 focus:ring-1 focus:ring-mentorBlue-400"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-mentorBlue-600 hover:bg-mentorBlue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <div className="h-px bg-slate-200 w-full" />
          <span className="px-4 text-sm text-slate-400 bg-white/50 rounded-full">OR</span>
          <div className="h-px bg-slate-200 w-full" />
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="mt-6 w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/signup" className="text-mentorBlue-600 font-medium hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
