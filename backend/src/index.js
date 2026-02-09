import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/db.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is cooking @ ${process.env.PORT}!`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed!", error);
    process.exit(1);
  });
