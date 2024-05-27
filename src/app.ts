import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";

const app = express();

app.get("/", (req, res, next) => {
    
    const err = createHttpError(401, "Something went wrong...");

    throw err;
    
    res.json({ message: "welcome to elib apis" });
});

// Global Error Handler

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === "development" ? err.stack : "",
    });
});

export default app;
