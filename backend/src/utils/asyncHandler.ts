// Utility to wrap async functions for Express routes
// Handles promise resolution and error catching

import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default asyncHandler;
