import React, { useState } from 'react';

const QuizScreen = ({ questions, onQuizComplete }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const currentQuestion = questions[currentQIndex];

    if (!currentQuestion) return null;

    // The answer key is server-side only for solo quizzes. Until the room payload
    // stops exposing it too, multiplayer can still show instant correctness.
    const correctOptionIndex =
        typeof currentQuestion.correctOptionIndex === 'number' ? currentQuestion.correctOptionIndex : null;

    const handleAnswer = (optionIndex) => {
        if (selectedIndex !== null) return;
        setSelectedIndex(optionIndex);

        setTimeout(() => {
            const newAnswers = [...answers, optionIndex];
            setAnswers(newAnswers);
            setSelectedIndex(null);
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(currentQIndex + 1);
            } else {
                onQuizComplete(newAnswers);
            }
        }, correctOptionIndex === null ? 600 : 1200);
    };

    const getButtonClass = (optionIndex) => {
        const idle = 'bg-white/10 hover:bg-white/20 border border-white/10 text-white';

        if (selectedIndex === null) return idle;

        // No key available: just confirm the choice and move on.
        if (correctOptionIndex === null) {
            return optionIndex === selectedIndex
                ? 'bg-indigo-500 border border-indigo-400 text-white'
                : `${idle} opacity-50`;
        }

        if (optionIndex === selectedIndex) {
            return correctOptionIndex === optionIndex
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white';
        }
        if (optionIndex === correctOptionIndex) return 'bg-green-500 text-white';
        return `${idle} opacity-50`;
    };

    const progress = ((currentQIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2 text-sm text-purple-200">
                        <span>Question {currentQIndex + 1} of {questions.length}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                        <div
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Rendered as text, not HTML: the AI is asked for plain text and the
                    prompt is not a trusted source for markup. */}
                <h2 className="text-2xl font-semibold mb-6 text-white">
                    {currentQuestion.prompt}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={selectedIndex !== null}
                            className={`p-4 rounded-xl text-left font-medium text-lg transition-all duration-300 ${getButtonClass(index)}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuizScreen;
