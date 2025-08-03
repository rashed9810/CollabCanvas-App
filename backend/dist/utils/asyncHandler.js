"use strict";
// Utility to wrap async functions for Express routes
// Handles promise resolution and error catching
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.default = asyncHandler;
