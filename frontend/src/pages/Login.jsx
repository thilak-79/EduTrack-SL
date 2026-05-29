import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, Languages, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
export default function Login() {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans">

      {/* Visual Banner Panel (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 school-gradient text-white flex-col justify-between p-12 relative overflow-hidden select-none">
        {/* Absolute Background Graphics */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3"></div>

        {/* Top Info */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white text-school-primary flex items-center justify-center font-extrabold text-xl shadow-lg">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide">
              SmartSchool <span className="text-blue-300">LK</span>
            </h1>
            <p className="text-[10px] font-bold text-blue-200 tracking-widest uppercase">
              Digital School Management
            </p>
          </div>
        </div>

        {/* Dynamic Center Slogan */}
        <div className="my-auto z-10 max-w-lg">
          <span className="text-xs font-extrabold text-blue-200 bg-white/10 px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
            Empowering Sri Lankan Education
          </span>

          <h2 className="text-4xl font-extrabold leading-tight mt-6 tracking-tight font-sans">
            Digitize your school operations. Connect teachers, parents, and students instantly.
          </h2>

          <p className="text-sm mt-4 text-blue-100/90 leading-relaxed font-sans font-light">
            An all-in-one administration portal designed for modern school structures, bringing real-time attendance markings, result calculations, class rankings, and emergency notification logs under a single dashboard.
          </p>
        </div>

        {/* Footer Credit */}
        <div className="z-10 text-xs text-blue-200/80 font-medium">
          © 2026 SmartSchool LK. All rights reserved.
        </div>
      </div>

      {/* Login Form Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white relative">

        {/* Language select top right */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <Languages className="w-4 h-4 text-slate-500" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer font-sans"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        {/* Card Form */}
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo on mobile view */}
          <div className="flex items-center gap-2 md:hidden mb-6 justify-center">
            <BookOpen className="w-8 h-8 text-school-primary" />
            <span className="font-extrabold text-xl text-slate-800 tracking-tight font-sans">
              SmartSchool <span className="text-school-accent">LK</span>
            </span>
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight">
              {t('portalTitle')}
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-sans">
              Please enter your email and password to log in
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-school-danger rounded-r-xl flex items-center gap-3">
              <span className="text-xs font-semibold text-red-600 font-sans">
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">
                {t('email')}
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary focus:bg-white transition-all font-sans"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">
                {t('password')}
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>

                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-primary/20 focus:border-school-primary focus:bg-white transition-all font-sans"
                    placeholder="Enter your password"
                    required
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-school-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-school-primary hover:bg-school-primary/95 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-school-primary/20 flex items-center justify-center gap-2 font-sans select-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>{t('login')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}