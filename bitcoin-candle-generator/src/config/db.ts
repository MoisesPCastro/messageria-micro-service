import { config } from "dotenv";
import { connect } from "mongoose";

export const connectToMongoDB = async () => {
  config();
  if (process.env.MONGODB_CONNECTION_URL)
    await connect(process.env.MONGODB_CONNECTION_URL);
};
