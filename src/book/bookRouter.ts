import express from "express";
import { createBook } from "./bookController";

const bookRouter = express.Router();

bookRouter.get("/create", createBook);

export default bookRouter;
