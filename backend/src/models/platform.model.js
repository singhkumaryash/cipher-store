import mongoose, { Schema } from "mongoose";

const platformSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    websiteUrl: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

platformSchema.index({ owner: 1, title: 1 }, { unique: true });

export const Platform = mongoose.model("Platform", platformSchema);
