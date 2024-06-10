import { Request, Response, NextFunction } from "express";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // const {} = req.body;
    try {
        res.json({
            message: "Ok",
        });
    } catch (err) {
        console.log(err);
    }
};

export { createBook };
