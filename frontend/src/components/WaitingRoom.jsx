import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WaitingRoom = ({ setAppState, roomId, setQuestions, setQuizSettings }) => {
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRoomStatus = useCallback(async () => {
        try {
            const { data } = await api.get(`/quiz/room/${roomId}/status`);
            setRoom(data);
            if (data.status === 'active') {
                setQuestions(data.questions);
                setQuizSettings(data.settings);
                setAppState('quiz');
            }
        } catch (error) {
            console.error("Failed to fetch room status:", error);
        }
    }, [roomId, setAppState, setQuestions, setQuizSettings]);

    useEffect(() => {
        fetchRoomStatus();
        const interval = setInterval(fetchRoomStatus, 3000);
        return () => clearInterval(interval);
    }, [fetchRoomStatus]);

    const handleStartQuiz = async () => {
        setLoading(true);
        try {
            await api.post(`/quiz/room/${roomId}/start`);
        } catch (error) {
            console.error("Failed to start quiz:", error);
            setLoading(false);
        }
    };

    if (!room) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="text-center text-white text-2xl font-medium">Loading Room...</div>
            </div>
        );
    }

    const isCreator = room.creatorId === user._id;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Waiting Room</h1>
                <p className="text-purple-200 mb-4">Share this Room ID with your friends:</p>
                <div className="bg-purple-800/20 border border-purple-400/30 shadow-inner rounded-lg p-4 mb-6">
                    <p className="text-3xl font-mono tracking-widest text-white">{roomId}</p>
                </div>

                <h2 className="text-xl font-semibold text-white mb-3">
                    Players Joined ({room.players.length})
                </h2>
                <div className="space-y-2 mb-8 h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent px-2">
                    {room.players.map(player => (
                        <p key={player.userId} className="bg-purple-400/10 text-white border border-purple-300/20 px-4 py-2 rounded-md shadow-sm">
                            {player.username}
                        </p>
                    ))}
                </div>

                {isCreator && room.status === 'waiting' ? (
                    <button
                        onClick={handleStartQuiz}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Generating Quiz...' : 'Start Quiz for Everyone'}
                    </button>
                ) : (
                    <p className="text-purple-300">Waiting for the host to start the quiz...</p>
                )}
            </div>
        </div>
    );
};

export default WaitingRoom;
