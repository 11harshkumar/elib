import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import fs from "node:fs";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, genre } = req.body;
        console.log(req.files);

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        const coverImageMimeType = files.coverImage[0].mimetype
            .split("/")
            .at(-1);
        const fileName = files.coverImage[0].filename;
        const filepath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filepath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        const bookFileName = files.file[0].filename;

        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: "pdf",
            }
        );

        console.log(uploadResult);
        console.log(bookFileUploadResult);

        // Create New Book

        const _req = req as AuthRequest

        const newBook = await bookModel.create({
            title: title,
            genre: genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        // Delete the temporary files
        await fs.promises.unlink(filepath);
        await fs.promises.unlink(bookFilePath);

        res.status(201).json({
            id: newBook._id,
        });
    } catch (error) {
        console.log(error);
        next(createHttpError(500, "Error while uploading the files"));
    }
};

export { createBook };
