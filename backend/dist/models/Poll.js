"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vote = exports.Poll = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pollOptionSchema = new mongoose_1.default.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    index: {
        type: Number,
        required: true,
        min: 0,
    },
});
const pollSchema = new mongoose_1.default.Schema({
    whiteboardId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Whiteboard",
        required: true,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500,
    },
    options: {
        type: [pollOptionSchema],
        required: true,
        validate: {
            validator: function (options) {
                return options.length >= 2 && options.length <= 10;
            },
            message: "Poll must have between 2 and 10 options",
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    allowMultipleVotes: {
        type: Boolean,
        default: false,
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 1440, // 24 hours
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    totalVotes: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Index for efficient queries
pollSchema.index({ whiteboardId: 1, isActive: 1 });
pollSchema.index({ expiresAt: 1 });
// Middleware to set expiresAt based on duration
pollSchema.pre("save", function (next) {
    if (this.isNew) {
        this.expiresAt = new Date(Date.now() + this.duration * 60 * 1000);
    }
    next();
});
const voteSchema = new mongoose_1.default.Schema({
    pollId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Poll",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    optionIndex: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});
// Compound index to prevent duplicate votes (unless multiple votes allowed)
voteSchema.index({ pollId: 1, userId: 1 });
exports.Poll = mongoose_1.default.model("Poll", pollSchema);
exports.Vote = mongoose_1.default.model("Vote", voteSchema);
