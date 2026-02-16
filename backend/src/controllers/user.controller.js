import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";

// Cookie options: sameSite 'none' needed for cross-origin (frontend on different domain)
const getCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  ...(process.env.NODE_ENV === "production" && { sameSite: "none" }),
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation failed:", error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = getCookieOptions();
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "Fullname, username, email and password are required!",
    );
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with given username or email already exists!",
    );
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registration!");
  }

  // Auto-login after register: return tokens so frontend works when deployed (cross-origin)
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const options = getCookieOptions();
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        ...createdUser.toObject?.() ?? createdUser,
        accessToken,
        refreshToken,
      }, "User registered successfully!"),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username and email are required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = getCookieOptions();
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        ...loggedInUser.toObject?.() ?? loggedInUser,
        accessToken,
        refreshToken,
      }, "user logged in successfully"),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = getCookieOptions();
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = req.user;

  const { username, email, fullname } = req.body;

  if (!username && !email && !fullname) {
    throw new ApiError(400, "Atleast one field is required!");
  }

  if (username) {
    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      throw new ApiError(400, "User with the given username already exists!");
    }
    user.username = username;
  }

  if (email) {
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      throw new ApiError(400, "User with given email already exists!");
    }
    user.email = email;
  }

  if (fullname) {
    user.fullname = fullname;
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully!"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndDelete(user._id);

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully!"));
});

export {
  refreshAccessToken,
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  updateUser,
  deleteUser,
  getUser,
};
