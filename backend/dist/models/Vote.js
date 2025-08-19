"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const voteSchema = new mongoose_1.Schema({
    pollId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Poll",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    whiteboardId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Whiteboard",
        required: true,
        index: true,
    },
    optionIndex: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});
// Compound indexes for efficient querying and constraints
voteSchema.index({ pollId: 1, userId: 1 }); // For checking existing votes
voteSchema.index({ pollId: 1, optionIndex: 1 }); // For vote counting
voteSchema.index({ whiteboardId: 1, createdAt: -1 }); // For user activity
// Ensure user can only vote once per poll (unless multiple votes allowed)
// This will be enforced in the application logic, not as a unique index
// because we need to handle the allowMultipleVotes case
const Vote = mongoose_1.default.model("Vote", voteSchema);
exports.default = Vote;
