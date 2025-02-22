import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// mongoose.model("User", userSchema,"authors"); // If we want to override the name of collection then we pass the 3rd parameter
export default mongoose.model<User>("User", userSchema);
