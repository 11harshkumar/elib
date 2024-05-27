import express from "express";
import globalErrorHandler from "./middlewares/gloabalErrorHandler";

const app = express();

app.get("/", (req, res, next) => {
    res.json({ message: "welcome to elib apis" });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
