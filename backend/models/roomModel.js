
import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    status: { type: String, enum: ['joined', 'finished'], default: 'joined' },
    answers: [String],
    score: { type: Number, default: 0 }
}, { _id: false });

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
        topic: String,
        numQuestions: Number,
        difficulty: String,
    },
    players: [playerSchema],
    questions: [mongoose.Schema.Types.Mixed],
    status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
