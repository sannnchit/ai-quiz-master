import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ setAppState }) => {
    const { user } = useAuth();
    
    const getBadge = (wins) => {
        if (wins >= 20) return { name: 'Quiz Master', color: 'text-orange-400' };
        if (wins >= 10) return { name: 'Veteran', color: 'text-purple-700' };
        if (wins >= 1) return { name: 'Rookie', color: 'text-green-400' };
        return { name: 'Newbie', color: 'text-black-400' };
    };

    const badge = getBadge(user?.stats.won || 0);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10">
                <h1 className="text-4xl font-extrabold text-white text-center mb-4 tracking-tight drop-shadow">
                    {user?.username}'s Profile
                </h1>

                <div className="text-center my-6">
                    <span className={`text-lg font-bold ${badge.color}`}>{badge.name}</span>
                    <div className="flex justify-center gap-12 mt-4 text-white">
                        <div>
                            <p className="text-2xl font-bold">{user?.stats.played}</p>
                            <p className="text-sm text-gray-300">Played</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{user?.stats.won}</p>
                            <p className="text-sm text-gray-300">Won</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-center text-white">Game History</h2>

                <div className="space-y-3 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent pr-1">
                    {user?.history.slice().reverse().map((game, index) => (
                        <div key={index} className="bg-purple-400/10 border border-purple-300/20 p-3 rounded-xl text-white shadow-sm">
                            <p className="font-semibold capitalize">{game.topic} ({game.type})</p>
                            <p className="text-sm text-purple-200">
                                {game.type === 'solo' 
                                    ? `Score: ${game.score}/${game.total}`
                                    : `Rank: ${game.rank} (${game.score}/${game.total}) - Room: ${game.roomId}`
                                }
                            </p>
                        </div>
                    ))}
                    {user?.history.length === 0 && (
                        <p className="text-purple-300 text-center">No games played yet.</p>
                    )}
                </div>

                <button
                    onClick={() => setAppState('home')}
                    className="w-full mt-8 text-gray-300 hover:text-white text-sm transition transform hover:scale-105"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
