import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuthScreen = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!username || !password) {
            setError('Username and password are required.');
            setLoading(false);
            return;
        }

        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            const { data } = await api.post(endpoint, { username, password });
            login(data);
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0d0d] px-4">
            <div className="w-full max-w-md bg-[#151515] border border-[#7c3aed] rounded-2xl shadow-[0_0_40px_#9f44ff80] p-8 relative z-10 overflow-hidden">
                <h1 className="text-4xl font-extrabold text-center text-[#f472b6] tracking-widest">
                    AI Quiz
                </h1>
                <p className="text-center text-[#9ca3af] mt-2 text-base uppercase tracking-wider">
                    {isLogin ? 'Log In to Play' : 'Create Your Identity'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-[#1f1f1f] text-[#e0e0e0] border border-[#9f44ff] focus:ring-2 focus:ring-[#d946ef] rounded-lg px-4 py-2 transition-all duration-200 outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#1f1f1f] text-[#e0e0e0] border border-[#9f44ff] focus:ring-2 focus:ring-[#d946ef] rounded-lg px-4 py-2 transition-all duration-200 outline-none"
                    />
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#22d3ee] hover:brightness-110 text-black font-bold py-2 rounded-lg transition-all duration-150 shadow-md active:scale-[0.98] disabled:opacity-60"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login 🔐' : 'Register ⚡')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    {isLogin ? "New user? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[#22d3ee] font-bold hover:underline"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
