import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("req", req.body.name);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        const error = createHttpError(400, "All Fields are required...");
        return next(error);
    }

    res.json({
        message: "User Created Successfuly...",
    });
};

export { createUser };
