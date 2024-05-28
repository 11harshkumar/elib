import express from "express";
import { createUser } from "./userController";

const userRouter = express.Router();

// Creating routes for the User
userRouter.post("/register", createUser);

export default userRouter;
