import React, { useState } from 'react';
import QuizSetup from './QuizSetup';
import api from '../services/api';

const MultiplayerLobby = ({ setAppState, setRoomId }) => {
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');

    const handleCreateRoom = async (settings) => {
        try {
            const { data } = await api.post('/quiz/room', { settings });
            setRoomId(data.roomId);
            setAppState('multiplayer-waiting');
        } catch (err) {
            setError('Could not create room. Please try again.');
        }
    };

    const handleJoin = async () => {
        if (!joinId) return;
        try {
            await api.post(`/quiz/room/${joinId}/join`);
            setRoomId(joinId);
            setAppState('multiplayer-waiting');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join room.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-2xl space-y-8">
                <QuizSetup
                    onQuizStart={handleCreateRoom}
                    title="Create a Room"
                    description="Set up a quiz for your friends."
                    buttonText="Create Room"
                    error={error}
                />

                <div className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6">
                    <h2 className="text-xl font-semibold text-center mb-4 text-gray-200">Join a Room</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={joinId}
                            onChange={e => setJoinId(e.target.value.toUpperCase())}
                            placeholder="ENTER ROOM ID"
                            className="flex-grow bg-purple-500/10 border border-purple-500/30 text-gray-100 placeholder-purple-300 rounded-lg px-4 py-2 shadow-[0_0_10px_1px_rgba(128,90,213,0.4)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <button
                            onClick={handleJoin}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-5 rounded-lg transition transform hover:scale-105 shadow-[0_0_10px_2px_rgba(192,132,252,0.4)]"
                        >
                            Join
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </div>

                <button
                    onClick={() => setAppState('home')}
                    className="block w-full text-center text-gray-300 hover:text-white text-sm"
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default MultiplayerLobby;
