
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import QuizSetup from './components/QuizSetup';
import MultiplayerLobby from './components/MultiplayerLobby';
import WaitingRoom from './components/WaitingRoom';
import QuizScreen from './components/QuizScreen';
import SoloResultsScreen from './components/SoloResultsScreen';
import MultiplayerResultsScreen from './components/MultiplayerResultsScreen';
import Spinner from './components/Spinner';
import api from './services/api';
import getErrorMessage from './services/getErrorMessage';

const App = () => {
    const { user, updateUser } = useAuth();
    const [appState, setAppState] = useState('home');
    const [quizId, setQuizId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [attempt, setAttempt] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState('');

    const handleSoloQuizStart = async (settings) => {
        setAppState('generating');
        setError('');
        try {
            const { data } = await api.post('/quizzes', settings);
            setQuizId(data.quizId);
            setQuestions(data.questions);
            setAppState('quiz');
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to generate quiz. Please try again.'));
            setAppState('solo-setup');
        }
    };

    const handleQuizComplete = async (answers) => {
        try {
            let data;

            if (roomId) {
                // Multiplayer: the server already holds the questions and the key.
                ({ data } = await api.post(`/rooms/${roomId}/submit`, { answers }));
            } else {
                // Solo: pair each chosen option index with the question it belongs to.
                ({ data } = await api.post(`/quizzes/${quizId}/attempts`, {
                    answers: answers.map((optionIndex, index) => ({
                        questionId: questions[index].id,
                        optionIndex,
                    })),
                }));
                setAttempt(data.attempt);
            }

            updateUser(data.user);
            setAppState(roomId ? 'multiplayer-results' : 'solo-results');
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to submit results.'));
            setAppState('home');
        }
    };

    const handlePlayAgain = () => {
        setAppState('home');
        setQuizId('');
        setQuestions([]);
        setAttempt(null);
        setRoomId('');
        setError('');
    };

    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <AuthScreen />
            </main>
        );
    }

    const renderContent = () => {
        switch (appState) {
            case 'home':
                return <HomeScreen setAppState={setAppState} />;
            case 'profile':
                return <ProfileScreen setAppState={setAppState} />;
            case 'solo-setup':
                return (
                    <div className="min-h-screen w-full bg-gradient-to-br from-[#1f1c2c] via-[#928DAB] to-[#1f1c2c] flex items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[10px] rounded-full -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                        <button
                            onClick={() => setAppState('home')}
                            className="absolute top-6 left-6 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium py-2 px-4 rounded-xl transition transform hover:scale-105 shadow-md"
                        >
                            ← Back to Home
                        </button>

                        <QuizSetup
                            onQuizStart={handleSoloQuizStart}
                            title="Solo Quiz"
                            description="Test your knowledge on any topic!"
                            error={error}
                        />
                    </div>
                );

            case 'multiplayer-lobby':
                return <MultiplayerLobby setAppState={setAppState} setRoomId={setRoomId} />;
            case 'multiplayer-waiting':
                return <WaitingRoom setAppState={setAppState} roomId={roomId} setQuestions={setQuestions} />;
            case 'multiplayer-results':
                return <MultiplayerResultsScreen onPlayAgain={handlePlayAgain} roomId={roomId} />;
            case 'generating':
                return <div className="text-center"><h2 className="text-2xl font-semibold mb-4">Generating your quiz...</h2><p className="text-gray-400 mb-6">The AI is crafting your questions!</p><Spinner /></div>;
            case 'quiz':
                return <QuizScreen questions={questions} onQuizComplete={handleQuizComplete} />;
            case 'solo-results':
                return <SoloResultsScreen attempt={attempt} onPlayAgain={handlePlayAgain} />;
            default:
                return <HomeScreen setAppState={setAppState} />;
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            {renderContent()}
        </main>
    );
};

export default App;
