import app from "./src/app";

const startServer = () => {
    const PORT = process.env.port || 3000;

    app.listen(PORT, () => {
        console.log(`Listening on PORT : ${PORT}`);
    });
};

startServer();
