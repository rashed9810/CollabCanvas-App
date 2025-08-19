"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pollController_1 = require("../controllers/pollController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
// Poll routes
router.post("/create", (0, asyncHandler_1.default)(pollController_1.createPoll));
router.post("/vote", (0, asyncHandler_1.default)(pollController_1.castVote));
router.get("/:id/results", (0, asyncHandler_1.default)(pollController_1.getPollResults));
router.get("/whiteboard/:whiteboardId/active", (0, asyncHandler_1.default)(pollController_1.getActivePolls));
router.patch("/:id/close", (0, asyncHandler_1.default)(pollController_1.closePoll));
exports.default = router;
