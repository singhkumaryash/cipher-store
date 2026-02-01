import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Platform } from "../models/platform.model.js";
import { Credential } from "../models/credential.model.js";

const addPlatform = asyncHandler(async (req, res) => {
  const user = req.user;

  const { title, websiteUrl } = req.body;

  if (!title) {
    throw new ApiError(400, "Platform title is required!");
  }

  let platform = await Platform.findOne({
    owner: user._id,
    title: title.trim().toLowerCase(),
  });

  if (platform) {
    throw new ApiError(400, "Platfrom already exists!");
  }

  platform = await Platform.create({
    title: title.trim().toLowerCase(),
    owner: user._id,
    websiteUrl: websiteUrl || undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, platform, "Platform created successfully!"));
});

const getAllPlatforms = asyncHandler(async (req, res) => {
  const user = req.user;

  const { title } = req.query;

  const filter = {
    owner: user._id,
  };

  if (title) {
    filter.title = title.trim().toLowerCase();
  }

  const platforms = await Platform.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, platforms, "Platforms fetched successfully"));
});

const getPlatform = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  const { title } = req.query;
  
  if (!id && !title) {
    throw new ApiError(400, "Please provide an ID or Title to search.");
  }

  let platform;

  if (id) {
    platform = await Platform.findOne({
      owner: user._id,
      _id: id,
    });
  } else if (title) {
    platform = await Platform.findOne({
      owner: user._id,
      title: title.trim().toLowerCase(),
    });
  }

  if (!platform) {
    throw new ApiError(400, "Platform does not exists!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, platform, "Platform fetched successfully!"));
});

const updatePlatform = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  const { title, websiteUrl } = req.body;

  if (!title && !websiteUrl) {
    throw new ApiError(400, "Atleast one field is required!");
  }

  let platform = await Platform.findOne({
    owner: user._id,
    _id: id,
  });

  if (!platform) {
    throw new ApiError(404, "Platform not found!");
  }

  if (title) {
    const normalizedTitle = title.trim().toLowerCase();

    if (normalizedTitle !== platform.title) {
      const duplicatePlatform = await Platform.findOne({
        owner: user._id,
        title: normalizedTitle,
      });

      if (duplicatePlatform) {
        throw new ApiError(409, "Platform with this title already exists!");
      }

      platform.title = normalizedTitle;
    }
  }

  if (websiteUrl) {
    platform.websiteUrl = websiteUrl;
  }

  await platform.save();

  res
    .status(200)
    .json(new ApiResponse(200, platform, "Platform updated successfully"));
});

const deletePlatform = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  const deletedPlatform = await Platform.findOneAndDelete({
    owner: user._id,
    _id: id,
  });

  if (!deletedPlatform) {
    throw new ApiError(404, "Platform not found!");
  }

  await Credential.deleteMany({
    platform: deletedPlatform._id,
    owner: user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Platform deleted successfully!"));
});

export {
  addPlatform,
  getAllPlatforms,
  getPlatform,
  updatePlatform,
  deletePlatform,
};
