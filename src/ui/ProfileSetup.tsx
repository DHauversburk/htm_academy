import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../game/store';
import { EventBus } from '../game/EventBus';
import { supabase } from '../lib/supabase';

export const ProfileSetup = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [authTab, setAuthTab] = useState<'social' | 'email'>('social');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const {
        playerName, setPlayerName,
        difficulty, setDifficulty,
        completeSetup, setAuthMode,
        avatarColor, setAvatarColor
    } = useGameStore();

    const AVATAR_COLORS = [
        { hex: 0xffffff, label: 'Standard' },
        { hex: 0x4ade80, label: 'Bio' },
        { hex: 0x00ffff, label: 'Electric' },
        { hex: 0xc084fc, label: 'Plasma' },
        { hex: 0xf472b6, label: 'Alert' },
        { hex: 0xfacc15, label: 'Hazard' }
    ];

    // Quick Start: Guest mode, skip everything
    const handleQuickStart = () => {
        setAuthMode('guest');
        setPlayerName(`Guest_${Math.floor(Math.random() * 9999)}`);
        setDifficulty('easy');
        completeSetup();
        EventBus.emit('tutorial-complete');
    };

    // Social Login
    const handleSocialLogin = async (provider: 'google' | 'github' | 'discord') => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                setError(`${provider} login failed. Try another method.`);
                setIsLoading(false);
            }
            // On success, Supabase redirects and handles the rest
        } catch (err) {
            setError('Social login unavailable. Try email instead.');
            setIsLoading(false);
        }
    };

    // Email/Password Auth
    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        // Password strength validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Try sign in first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                // If sign in fails, try sign up
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: playerName || 'BMET'
                        }
                    }
                });

                if (signUpError) {
                    setError('Authentication failed. Check your credentials.');
                    setIsLoading(false);
                    return;
                }
            }

            setAuthMode('authenticated');
            await proceedToGame();
        } catch (err) {
            setError('Connection error. Try again.');
            setIsLoading(false);
        }
    };

    // Forgot Password
    const handleForgotPassword = async () => {
        if (!email) {
            setError('Enter your email first');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                setError('Reset failed. Check your email address.');
            } else {
                setError(null);
                alert('Password reset link sent! Check your email.');
            }
        } catch (err) {
            setError('Unable to send reset email');
        }
        setIsLoading(false);
    };

    const proceedToGame = async () => {
        if (!playerName.trim()) {
            setPlayerName('Technician');
        }

        completeSetup();
        EventBus.emit('start-tutorial');
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full py-8"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-2">
                        HTM ACADEMY
                    </h1>
                    <p className="text-slate-400">Biomedical Equipment Training</p>
                </div>

                {/* Quick Start - Always Visible */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl p-5 mb-4 shadow-2xl border-2 border-blue-400 transition"
                    onClick={handleQuickStart}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <div className="text-xl font-bold text-white">⚡ Quick Start</div>
                            <div className="text-blue-100 text-sm">Play now as guest</div>
                        </div>
                        <div className="text-3xl text-white">→</div>
                    </div>
                </motion.button>

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-slate-950 text-slate-400">OR</span>
                    </div>
                </div>

                {/* Auth Card */}
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                    <div
                        className="flex items-center justify-between cursor-pointer mb-4"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <h3 className="text-lg font-semibold text-white">🔐 Create Account / Sign In</h3>
                        <span className="text-slate-400">{showAdvanced ? '▼' : '▶'}</span>
                    </div>

                    {showAdvanced && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Social / Email Tabs */}
                            <div className="flex gap-2 bg-slate-900 rounded-lg p-1">
                                <button
                                    onClick={() => setAuthTab('social')}
                                    className={`flex-1 py-2 rounded-md font-medium transition ${authTab === 'social' ? 'bg-blue-600 text-white' : 'text-slate-400'
                                        }`}
                                >
                                    Social Login
                                </button>
                                <button
                                    onClick={() => setAuthTab('email')}
                                    className={`flex-1 py-2 rounded-md font-medium transition ${authTab === 'email' ? 'bg-blue-600 text-white' : 'text-slate-400'
                                        }`}
                                >
                                    Email
                                </button>
                            </div>

                            {/* Social Login Buttons */}
                            {authTab === 'social' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={isLoading}
                                        className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition disabled:opacity-50 shadow"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <button
                                        onClick={() => handleSocialLogin('github')}
                                        disabled={isLoading}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition disabled:opacity-50 border border-slate-700"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                        </svg>
                                        Continue with GitHub
                                    </button>

                                    <button
                                        onClick={() => handleSocialLogin('discord')}
                                        disabled={isLoading}
                                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                        Continue with Discord
                                    </button>
                                </div>
                            )}

                            {/* Email/Password Form */}
                            {authTab === 'email' && (
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password (8+ characters)"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                                    />

                                    <button
                                        onClick={handleForgotPassword}
                                        className="text-sm text-blue-400 hover:text-blue-300"
                                    >
                                        Forgot password?
                                    </button>

                                    <button
                                        onClick={handleEmailAuth}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                    >
                                        {isLoading ? 'Please wait...' : 'Sign In / Sign Up'}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded border border-red-800">
                                    {error}
                                </div>
                            )}

                            {/* Customization Options */}
                            <details className="mt-4">
                                <summary className="text-slate-400 cursor-pointer hover:text-slate-200 py-2 text-sm">
                                    ⚙️ Customize Profile
                                </summary>
                                <div className="mt-3 space-y-3 pl-2">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={playerName}
                                            onChange={(e) => setPlayerName(e.target.value)}
                                            placeholder="Your name..."
                                            maxLength={20}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['easy', 'medium', 'hard'].map((diff) => (
                                                <button
                                                    key={diff}
                                                    onClick={() => setDifficulty(diff as any)}
                                                    className={`px-3 py-2 rounded text-xs font-semibold transition ${difficulty === diff
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-700 text-slate-300'
                                                        }`}
                                                >
                                                    {diff === 'easy' && 'Intern'}
                                                    {diff === 'medium' && 'BMET'}
                                                    {diff === 'hard' && 'Expert'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Avatar Color</label>
                                        <div className="flex gap-2">
                                            {AVATAR_COLORS.map((color) => (
                                                <button
                                                    key={color.hex}
                                                    onClick={() => setAvatarColor(color.hex)}
                                                    className={`w-8 h-8 rounded transition ${avatarColor === color.hex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                                                        }`}
                                                    style={{ backgroundColor: `#${color.hex.toString(16).padStart(6, '0')}` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </motion.div>
                    )}
                </div>

                <p className="text-xs text-center text-slate-500 mt-4">
                    By continuing, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
};
