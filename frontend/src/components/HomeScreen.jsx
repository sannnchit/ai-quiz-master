import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ setAppState }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-12 text-center">
                <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">{user?.username}</h1>
                <p className="text-gray-300 mb-10 text-lg">Choose game mode</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setAppState('solo-setup')}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                    >
                        📚 Solo Quiz
                    </button>
                    <button
                        onClick={() => setAppState('multiplayer-lobby')}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                    >
                        🎮 Multiplayer
                    </button>
                    <button
                        onClick={() => setAppState('profile')}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                    >
                        👤 View Profile
                    </button>
                    <button
                        onClick={logout}
                        className="w-full bg-black/20 hover:bg-black/10 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl transition"
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
