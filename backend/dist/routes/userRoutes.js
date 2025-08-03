"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
// Public routes
router.post("/", (0, asyncHandler_1.default)(userController_1.registerUser));
router.post("/login", (0, asyncHandler_1.default)(userController_1.loginUser));
// Protected routes
router.post("/logout", auth_1.protect, (0, asyncHandler_1.default)(userController_1.logoutUser));
router.get("/profile", auth_1.protect, (0, asyncHandler_1.default)(userController_1.getUserProfile));
exports.default = router;
