"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whiteboardController_1 = require("../controllers/whiteboardController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.protect);
router
    .route("/")
    .post((0, asyncHandler_1.default)(whiteboardController_1.createWhiteboard))
    .get((0, asyncHandler_1.default)(whiteboardController_1.getWhiteboards));
router
    .route("/:id")
    .get((0, asyncHandler_1.default)(whiteboardController_1.getWhiteboardById))
    .put((0, asyncHandler_1.default)(whiteboardController_1.updateWhiteboard))
    .delete((0, asyncHandler_1.default)(whiteboardController_1.deleteWhiteboard));
router.route("/:id/collaborators").post((0, asyncHandler_1.default)(whiteboardController_1.addCollaborator));
router
    .route("/:id/collaborators/:userId")
    .delete((0, asyncHandler_1.default)(whiteboardController_1.removeCollaborator));
exports.default = router;
