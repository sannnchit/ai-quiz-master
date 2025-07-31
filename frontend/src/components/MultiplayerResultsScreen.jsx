import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const MultiplayerResultsScreen = ({ onPlayAgain, roomId }) => {
    const [room, setRoom] = useState(null);

    const fetchRoomStatus = useCallback(async () => {
        try {
            const { data } = await api.get(`/quiz/room/${roomId}/status`);
            setRoom(data);
        } catch (error) {
            console.error("Failed to fetch results:", error);
        }
    }, [roomId]);

    useEffect(() => {
        fetchRoomStatus();
        const interval = setInterval(() => {
            if (room?.status !== 'finished') {
                fetchRoomStatus();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchRoomStatus, room]);

    if (!room) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="text-center text-white text-2xl font-medium">Loading results...</div>
            </div>
        );
    }

    const allPlayersFinished = room.status === 'finished';
    const leaderboard = [...room.players].sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow">🏆 Leaderboard</h1>

                {!allPlayersFinished && (
                    <p className="text-purple-200 mb-6 text-lg">Waiting for all players to finish...</p>
                )}

                <div className="space-y-3 mb-8">
                    {leaderboard.map(({ username, score }, index) => (
                        <div
                            key={username}
                            className="flex justify-between items-center bg-purple-400/10 border border-purple-300/20 text-white px-5 py-3 rounded-xl shadow-md"
                        >
                            <span className="font-semibold text-left">
                                {index + 1}. {username}
                            </span>
                            <span className="font-semibold text-black-700">
                                {score} / {room.settings.numQuestions}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onPlayAgain}
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                    🔁 Back to Home
                </button>
            </div>
        </div>
    );
};

export default MultiplayerResultsScreen;
