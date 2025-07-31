import React, { useState } from 'react';

const QuizSetup = ({ onQuizStart, title, description, error, buttonText = "Start Quiz" }) => {
    const [settings, setSettings] = useState({ topic: '', numQuestions: 5, difficulty: 'Medium' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onQuizStart(settings);
    };

    return (
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-200">{title}</h1>
            <p className="text-center text-gray-300 mb-8">{description}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    type="text"
                    value={settings.topic}
                    onChange={(e) => setSettings({ ...settings, topic: e.target.value })}
                    placeholder="e.g., World War 2"
                    className="w-full bg-purple-500/10 border border-purple-500/30 text-gray-100 placeholder-purple-300 rounded-lg px-4 py-2 shadow-[0_0_10px_1px_rgba(128,90,213,0.4)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                />
                <input
                    type="number"
                    min="1"
                    max="15"
                    value={settings.numQuestions}
                    onChange={(e) => setSettings({ ...settings, numQuestions: parseInt(e.target.value) })}
                    placeholder="Number of Questions"
                    className="w-full bg-purple-500/10 border border-purple-500/30 text-gray-100 placeholder-purple-300 rounded-lg px-4 py-2 shadow-[0_0_10px_1px_rgba(128,90,213,0.4)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                />
                <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map(level => (
                        <button
                            type="button"
                            key={level}
                            onClick={() => setSettings({ ...settings, difficulty: level })}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md ${
                                settings.difficulty === level
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/10 text-gray-100 hover:bg-white/20'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_10px_2px_rgba(99,102,241,0.4)] transition transform hover:scale-105"
                >
                    {buttonText}
                </button>
            </form>
        </div>
    );
};

export default QuizSetup;
