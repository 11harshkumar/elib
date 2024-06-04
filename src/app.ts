import express from "express";
import globalErrorHandler from "./middlewares/gloabalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

app.get("/", (req, res, next) => {
    res.json({ message: "welcome to elib apis" });
});

// Registering the user Router
app.use("/api/users", userRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
