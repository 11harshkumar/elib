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

        const _req = req as AuthRequest;

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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;
    const _req = req as AuthRequest;
    const files = req.files as {
        [filename: string]: Express.Multer.File[];
    };
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
        return next(createHttpError(404, "Book Not Found"));
    }

    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "Unauthorized"));
    }

    // Checking whether we have files to upload or not

    let completeCoverImage = "";
    // Upload cover image file
    if (files.coverImage) {
        try {
            const filename = files.coverImage[0].filename;
            const convertMimeType = files.coverImage[0].mimetype
                .split("/")
                .at(-1);

            const filePath = path.resolve(
                __dirname,
                "../../public/data/uploads/" + filename
            );

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: filename,
                folder: "book-covers",
                format: convertMimeType,
            });
            completeCoverImage = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
        } catch (error) {
            return next(createHttpError(400, "Error in updating cover Image"));
        }
    }

    // Upload file
    let completeFileUrl = "";
    if (files.file) {
        try {
            const filename = files.file[0].filename;

            const completFilePath = path.resolve(
                __dirname,
                "../../public/data/uploads/" + filename
            );

            const uploadFileResult = await cloudinary.uploader.upload(
                completFilePath,
                {
                    resource_type: "raw",
                    filename_override: filename,
                    folder: "book-pdfs",
                    format: "pdf",
                }
            );
            completeFileUrl = uploadFileResult.secure_url;
            await fs.promises.unlink(completFilePath);
        } catch (error) {
            return next(createHttpError(400, "Error in updating file record"));
        }
    }

    const updatedBook = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage
                ? completeCoverImage
                : book.coverImage,
            file: completeFileUrl ? completeFileUrl : book.file,
        },
        {
            new: true,
        }
    );

    return res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await bookModel.find();
        return res.status(200).json(books);
    } catch (error) {
        return next(createHttpError(500, "Error while getting a book"));
    }
};

export { createBook, updateBook, listBooks };
