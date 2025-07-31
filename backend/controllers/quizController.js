
import { GoogleGenAI, Type } from "@google/genai";
import Room from '../models/roomModel.js';
import User from '../models/userModel.js';

const generateQuizQuestions = async (settings) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate a quiz with ${settings.numQuestions} questions on the topic of "${settings.topic}". The difficulty level should be ${settings.difficulty}. For each question, provide 4 multiple-choice options, and specify the correct answer. Ensure the question and options are plain text.`;
        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswer']
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7
            },
        });

        const text = response.text.trim();
        const quizData = JSON.parse(text);

        if (!Array.isArray(quizData) || quizData.length === 0 || quizData.some(q => !q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer)) {
            throw new Error("AI returned data in an unexpected format.");
        }
        return quizData;
    } catch (error) {
        console.error("Error generating quiz from API:", error);
        throw new Error("Failed to generate quiz questions.");
    }
};

export const generateSoloQuiz = async (req, res) => {
    try {
        const questions = await generateQuizQuestions(req.body);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createRoom = async (req, res) => {
    const { settings } = req.body;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        const newRoom = await Room.create({
            roomId,
            creatorId: req.user._id,
            settings,
            players: [{ userId: req.user._id, username: req.user.username }],
        });
        console.log(newRoom);
        res.status(201).json(newRoom);
    } catch (error) {
        console.error("Error creating room:", error, "Request user:", req.user);
        res.status(500).json({ message: 'Could not create room' });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.players.find(p => p.userId.equals(req.user._id))) {
            return res.json(room); // Already in room
        }
        room.players.push({ userId: req.user._id, username: req.user.username });
        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Could not join room' });
    }
};

export const getRoomStatus = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room status' });
    }
};

export const startQuiz = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!room.creatorId.equals(req.user._id)) return res.status(403).json({ message: 'Only the creator can start the quiz' });
        
        const questions = await generateQuizQuestions(room.settings);
        room.questions = questions;
        room.status = 'active';
        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Failed to start quiz' });
    }
};

export const submitSolo = async (req, res) => {
    const { answers, questions, settings } = req.body;
    const score = answers.reduce((acc, answer, index) => (answer === questions[index].correctAnswer ? acc + 1 : acc), 0);

    try {
        const isWin = score / questions.length >= 0.5;
        const user = await User.findById(req.user._id);
        user.stats.played += 1;
        if (isWin) user.stats.won += 1;
        user.history.push({
            type: 'solo',
            topic: settings.topic,
            score,
            total: questions.length
        });
        await user.save();
        res.json(user);
    } catch (error) {
        console.error("Error submitting solo answers:", error);
        res.status(500).json({ message: 'Error submitting solo answers' });
    }
};

export const submitMultiplayerAnswers = async (req, res) => {
    const { answers } = req.body;
    const { roomId } = req.params;

    try {
        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (room.status !== 'active') return res.status(400).json({ message: 'Quiz is not active.' });

        const questions = room.questions;
        const score = answers.reduce((acc, answer, index) => (answer === questions[index].correctAnswer ? acc + 1 : acc), 0);

        const playerIndex = room.players.findIndex(p => p.userId.equals(req.user._id));
        if (playerIndex === -1) return res.status(404).json({ message: 'Player not found in this room' });

        room.players[playerIndex].answers = answers;
        room.players[playerIndex].score = score;
        room.players[playerIndex].status = 'finished';

        const allFinished = room.players.every(p => p.status === 'finished');
        
        if (allFinished) {
            room.status = 'finished';
            const leaderboard = room.players.sort((a, b) => b.score - a.score);

            await Promise.all(leaderboard.map(async (player, index) => {
                const userToUpdate = await User.findById(player.userId);
                if (userToUpdate) {
                    const playerRank = index + 1;
                    const playerWon = player.score > 0 && (player.score / questions.length) >= 0.5;
                    userToUpdate.stats.played += 1;
                    if (playerWon) userToUpdate.stats.won += 1;
                    userToUpdate.history.push({
                        type: 'multiplayer',
                        topic: room.settings.topic,
                        score: player.score,
                        total: questions.length,
                        rank: playerRank.toString(),
                        roomId
                    });
                    await userToUpdate.save();
                }
            }));
        }

        await room.save();
        const updatedUser = await User.findById(req.user._id);
        res.json(updatedUser);

    } catch (error) {
        console.error("Error submitting multiplayer answers:", error);
        res.status(500).json({ message: 'Error submitting answers' });
    }
};
