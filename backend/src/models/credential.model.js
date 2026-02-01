import mongoose, { Schema } from "mongoose";
import { decrypt, encrypt } from "../utils/encryption.js";
import { ApiError } from "../utils/ApiError.js";

const credentialSchema = new Schema(
  {
    platform: {
      type: Schema.Types.ObjectId,
      ref: "Platform",
      required: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    iv: {
      type: String,
    },
    encryptedPassword: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.encryptedPassword;
        delete ret.iv;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

credentialSchema.pre("save", function (next) {
  if (!this.email && !this.username) {
    return next(new ApiError(400, "Either email or username is required!"));
  }

  if (!this.encryptedPassword || !this.iv) {
    return next(
      new ApiError(400, "Password is required! (Encryption failed!)"),
    );
  }

  next();
});

credentialSchema.virtual("password").set(function (plainTextPassword) {
  if (plainTextPassword) {
    const { iv, encryptedData } = encrypt(plainTextPassword);
    this.encryptedPassword = encryptedData;
    this.iv = iv;
  }
});

credentialSchema.virtual("password").get(function () {
  if (this.iv && this.encryptedPassword) {
    return decrypt({
      iv: this.iv,
      encryptedData: this.encryptedPassword,
    });
  }

  return undefined;
});

export const Credential = mongoose.model("Credential", credentialSchema);
