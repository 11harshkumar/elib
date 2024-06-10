import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    // console.log("req", req.body.name);
    const { name, email, password } = req.body;

    //Validation

    if (!name || !email || !password) {
        const error = createHttpError(400, "All Fields are required...");
        return next(error);
    }

    // Database call

    // const user = await userModel.findOne({ email }); In js we can use this way also if we have the key and value of same name in this case it was "email"

    const user = await userModel.findOne({ email: email });

    if (user) {
        const error = createHttpError(
            400,
            "User already exists with this email..."
        );
        return next(error);
    }

    // Hashed Password

    const hashedPassword = await bcrypt.hash(password,10);

    res.json({
        message: "User Created Successfuly...",
    });
};

export { createUser };
