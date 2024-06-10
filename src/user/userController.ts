import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

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

    // Error Handling is also required...
    try {
        const user = await userModel.findOne({ email: email });
        if (user) {
            const error = createHttpError(
                400,
                "User already exists with this email..."
            );
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Error while getting the user..."));
    }

    // Hashed Password

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser: User;

    try {
        newUser = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        });
    } catch (error) {
        return next(
            createHttpError(500, "Error while creating the new user...")
        );
    }

    // Token Generation -JWT
    try {
        const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
            expiresIn: "7d",
            algorithm: "HS256",
        });
        res.status(201).json({
            accessToken: token,
        });
    } catch (error) {
        return next(createHttpError(500, "Error While signing the jwt token"));
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    // Get the login email and password

    const { email, password } = req.body;

    if (!email || !password) {
        const error = createHttpError(
            400,
            "Please enter all the required details..."
        );
        return next(error);
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
        const error = createHttpError(404, "User not found");
        return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return next(createHttpError(400, "Invalid password"));
    }

    // If Password matches then create a new access token
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
        expiresIn: "7d",
        algorithm: "HS256",
    });

    res.json({
        accessToken: token,
    });
};

export { createUser, loginUser };
