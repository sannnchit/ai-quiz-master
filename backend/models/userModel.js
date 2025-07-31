
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const historySchema = new mongoose.Schema({
    type: { type: String, enum: ['solo', 'multiplayer'], required: true },
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    rank: { type: String, default: 'N/A' },
    roomId: { type: String, default: 'N/A' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: {
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 }
    },
    history: [historySchema]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
