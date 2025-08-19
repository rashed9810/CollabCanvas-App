"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePoll = exports.getActivePolls = exports.getPollResults = exports.castVote = exports.createPoll = void 0;
const Poll_1 = require("../models/Poll");
const Whiteboard_1 = __importDefault(require("../models/Whiteboard"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Create a new poll
// @route   POST /api/polls/create
// @access  Private
const createPoll = async (req, res, next) => {
    const { whiteboardId, question, options, duration, allowMultipleVotes } = req.body;
    try {
        // Validate required fields
        if (!whiteboardId || !question || !options || !duration) {
            res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
            return;
        }
        // Validate whiteboard exists and user has access
        const whiteboard = await Whiteboard_1.default.findById(whiteboardId);
        if (!whiteboard) {
            res.status(404).json({
                success: false,
                message: "Whiteboard not found",
            });
            return;
        }
        const isOwner = whiteboard.owner.toString() === req.user._id.toString();
        const isCollaborator = whiteboard.collaborators.some((id) => id.toString() === req.user._id.toString());
        if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
            res.status(403).json({
                success: false,
                message: "Not authorized to create polls in this whiteboard",
            });
            return;
        }
        // Validate options
        if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
            res.status(400).json({
                success: false,
                message: "Poll must have between 2 and 10 options",
            });
            return;
        }
        // Validate duration
        if (duration < 1 || duration > 1440) {
            res.status(400).json({
                success: false,
                message: "Duration must be between 1 minute and 24 hours",
            });
            return;
        }
        // Create poll
        const poll = await Poll_1.Poll.create({
            whiteboardId,
            createdBy: req.user._id,
            question: question.trim(),
            options: options.map((option, index) => ({
                text: option.text.trim(),
                index,
            })),
            duration,
            allowMultipleVotes: allowMultipleVotes || false,
        });
        // Populate creator info
        await poll.populate("createdBy", "name email");
        res.status(201).json({
            success: true,
            poll,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPoll = createPoll;
// @desc    Cast a vote
// @route   POST /api/polls/vote
// @access  Private
const castVote = async (req, res, next) => {
    const { pollId, optionIndex } = req.body;
    try {
        // Validate required fields
        if (!pollId || optionIndex === undefined) {
            res.status(400).json({
                success: false,
                message: "Please provide poll ID and option index",
            });
            return;
        }
        // Find poll
        const poll = await Poll_1.Poll.findById(pollId);
        if (!poll) {
            res.status(404).json({
                success: false,
                message: "Poll not found",
            });
            return;
        }
        // Check if poll is active and not expired
        if (!poll.isActive || new Date() > poll.expiresAt) {
            res.status(400).json({
                success: false,
                message: "Poll is no longer active",
            });
            return;
        }
        // Validate option index
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            res.status(400).json({
                success: false,
                message: "Invalid option index",
            });
            return;
        }
        // Check if user has already voted (unless multiple votes allowed)
        if (!poll.allowMultipleVotes) {
            const existingVote = await Poll_1.Vote.findOne({
                pollId,
                userId: req.user._id,
            });
            if (existingVote) {
                res.status(400).json({
                    success: false,
                    message: "You have already voted in this poll",
                });
                return;
            }
        }
        // Cast vote
        await Poll_1.Vote.create({
            pollId,
            userId: req.user._id,
            optionIndex,
        });
        // Update total votes count
        await Poll_1.Poll.findByIdAndUpdate(pollId, {
            $inc: { totalVotes: 1 },
        });
        res.json({
            success: true,
            message: "Vote cast successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.castVote = castVote;
// @desc    Get poll results
// @route   GET /api/polls/:id/results
// @access  Private
const getPollResults = async (req, res, next) => {
    try {
        const poll = await Poll_1.Poll.findById(req.params.id).populate("createdBy", "name email");
        if (!poll) {
            res.status(404).json({
                success: false,
                message: "Poll not found",
            });
            return;
        }
        // Get vote counts for each option
        const voteCounts = await Poll_1.Vote.aggregate([
            { $match: { pollId: new mongoose_1.default.Types.ObjectId(req.params.id) } },
            { $group: { _id: "$optionIndex", count: { $sum: 1 } } },
        ]);
        // Create results array
        const results = poll.options.map((option) => {
            const voteCount = voteCounts.find((vc) => vc._id === option.index);
            const votes = voteCount ? voteCount.count : 0;
            const percentage = poll.totalVotes > 0 ? (votes / poll.totalVotes) * 100 : 0;
            return {
                optionIndex: option.index,
                text: option.text,
                votes,
                percentage,
            };
        });
        // Check if current user has voted
        const userVote = await Poll_1.Vote.findOne({
            pollId: req.params.id,
            userId: req.user._id,
        }).sort({ createdAt: -1 });
        res.json({
            success: true,
            poll,
            results,
            userHasVoted: !!userVote,
            userVote: userVote
                ? {
                    optionIndex: userVote.optionIndex,
                    createdAt: userVote.createdAt,
                }
                : null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPollResults = getPollResults;
// @desc    Get active polls for a whiteboard
// @route   GET /api/polls/whiteboard/:whiteboardId/active
// @access  Private
const getActivePolls = async (req, res, next) => {
    try {
        const { whiteboardId } = req.params;
        // Validate whiteboard exists and user has access
        const whiteboard = await Whiteboard_1.default.findById(whiteboardId);
        if (!whiteboard) {
            res.status(404).json({
                success: false,
                message: "Whiteboard not found",
            });
            return;
        }
        const isOwner = whiteboard.owner.toString() === req.user._id.toString();
        const isCollaborator = whiteboard.collaborators.some((id) => id.toString() === req.user._id.toString());
        if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
            res.status(403).json({
                success: false,
                message: "Not authorized to view polls in this whiteboard",
            });
            return;
        }
        // Get active polls that haven't expired
        const polls = await Poll_1.Poll.find({
            whiteboardId,
            isActive: true,
            expiresAt: { $gt: new Date() },
        })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            polls,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActivePolls = getActivePolls;
// @desc    Close a poll
// @route   PATCH /api/polls/:id/close
// @access  Private
const closePoll = async (req, res, next) => {
    try {
        const poll = await Poll_1.Poll.findById(req.params.id);
        if (!poll) {
            res.status(404).json({
                success: false,
                message: "Poll not found",
            });
            return;
        }
        // Check if user is the creator
        if (poll.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({
                success: false,
                message: "Only the poll creator can close the poll",
            });
            return;
        }
        // Close the poll
        poll.isActive = false;
        await poll.save();
        res.json({
            success: true,
            message: "Poll closed successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.closePoll = closePoll;
