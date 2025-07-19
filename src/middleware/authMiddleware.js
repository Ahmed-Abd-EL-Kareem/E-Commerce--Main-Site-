import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../modules/user/userModel.js";
import { AppError } from "../utils/appError.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  let decodedToken;
  try {
    decodedToken = await promisify(jwt.verify)(token, JWT_SECRET);
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(new AppError("User does not exist!", 404));
  }

  req.user = user;
  next();
});
