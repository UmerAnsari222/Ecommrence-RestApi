import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      unique: true,
    },
  },
  { timestamps: false }
);

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
  "refreshToken"
);

export default RefreshToken;
