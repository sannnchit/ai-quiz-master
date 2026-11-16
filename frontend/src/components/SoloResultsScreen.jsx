import React from 'react';

const SoloResultsScreen = ({ attempt, onPlayAgain }) => {
    if (!attempt) return null;

    const { score, total, percentage, passed, review } = attempt;
    const circumference = 2 * Math.PI * 45;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10 text-center">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow">
                    🎉 Quiz Complete!
                </h1>
                <p className="text-xl text-purple-200 mb-6">You scored</p>

                <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-indigo-500"
                            strokeWidth="8"
                            strokeDasharray={`${(percentage * circumference) / 100} ${circumference}`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                                transition: 'stroke-dasharray 1s ease-out',
                            }}
                        />
                    </svg>
                    <span className="absolute text-4xl font-bold text-white">{percentage}%</span>
                </div>

                <p className="text-lg text-purple-300 mb-2">
                    {score} out of {total} correct
                </p>
                <p className={`text-sm font-semibold mb-6 ${passed ? 'text-green-400' : 'text-orange-300'}`}>
                    {passed ? 'Passed' : 'Keep practising'}
                </p>

                <h2 className="text-lg font-semibold text-white mb-3 text-left">Answer review</h2>
                <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent pr-1 text-left">
                    {review.map((item, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-xl border shadow-sm ${
                                item.isCorrect
                                    ? 'bg-green-500/10 border-green-400/30'
                                    : 'bg-red-500/10 border-red-400/30'
                            }`}
                        >
                            <p className="font-semibold text-white text-sm">
                                {index + 1}. {item.prompt}
                            </p>
                            <p className="text-sm text-green-300 mt-1">
                                Correct: {item.options[item.correctOptionIndex]}
                            </p>
                            {!item.isCorrect && (
                                <p className="text-sm text-red-300">
                                    You chose: {item.options[item.chosenOptionIndex] ?? 'No answer'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={onPlayAgain}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                    🔁 Exit Quiz
                </button>
            </div>
        </div>
    );
};

export default SoloResultsScreen;
