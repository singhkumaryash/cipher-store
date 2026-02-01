import { Platform } from "../models/platform.model.js";
import { Credential } from "../models/credential.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCredential = asyncHandler(async (req, res) => {
  const { title, email, username, password, websiteUrl } = req.body;

  if (!title || !password || (!email && !username)) {
    throw new ApiError(
      400,
      "Title, password, and either username or email are required!",
    );
  }

  const user = req.user;

  let platform = await Platform.findOne({
    owner: user._id,
    title: title.trim().toLowerCase(),
  });

  if (!platform) {
    platform = await Platform.create({
      title: title.trim().toLowerCase(),
      owner: user._id,
      websiteUrl: websiteUrl || undefined,
    });
  }

  const credential = await Credential.create({
    platform: platform._id,
    owner: user._id,
    username: username || undefined,
    password,
    email: email || undefined,
  });

  if (!credential) {
    throw new ApiError(500, "Something went wrong while adding credentials!");
  }

  const createdCredential = await Credential.findById(credential._id).select(
    "-encryptedPassword -iv",
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdCredential,
        "Credentials added successfully!",
      ),
    );
});

const getCredentials = asyncHandler(async (req, res) => {
  const user = req.user;

  let { platform } = req.query;

  const filter = {
    owner: user._id,
  };

  if (platform) {
    platform = platform.trim().toLowerCase();

    const platformDoc = await Platform.findOne({
      title: platform,
      owner: user._id,
    });

    if (!platformDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, [], "No credentials found for this platform!"),
        );
    }

    filter.platform = platformDoc._id;
  }

  const credentials = await Credential.find(filter)
    .select("-iv -encryptedPassword")
    .populate("platform", "title websiteUrl");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        credentials,
        "User credentials fetched successfully!",
      ),
    );
});

const getCredentialById = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  const credential = await Credential.findOne({
    owner: user._id,
    _id: id,
  })
    .select("-iv -encryptedPassword")
    .populate("platform", "title websiteUrl");

  if (!credential) {
    throw new ApiError(404, "Credential not found (or you don't have access)");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, credential, "User credential fetched successfully!"),
    );
});

const updateCredentials = asyncHandler(async (req, res) => {
  const user = req.user;

  const { username, email, password } = req.body;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  if (!username && !email && !password) {
    throw new ApiError(400, "Atleast one field is required to update!");
  }

  let credential = await Credential.findOne({
    _id: id,
    owner: user._id,
  });

  if (!credential) {
    throw new ApiError(404, "Credential not found or unauthorized access!");
  }

  if (username) credential.username = username;
  if (email) credential.email = email;
  if (password) credential.password = password;

  await credential.save();

  const updatedCredential = await Credential.findById(credential._id)
    .select("-encryptedPassword -iv")
    .populate("platform", "title websiteUrl");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCredential,
        "Credentials updated successfully!",
      ),
    );
});

const deleteCredential = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  const deletedCredential = await Credential.findOneAndDelete({
    _id: id,
    owner: user._id,
  });

  if (!deletedCredential) {
    throw new ApiError(404, "Credential not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Credential deleted successfully"));
});

const revealPassword = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required!");
  }

  const credential = await Credential.findOne({
    _id: id,
    owner: user._id,
  });

  if (!credential) {
    throw new ApiError(404, "Credential not found or unauthorized");
  }

  const decryptedPassword = credential.password;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { password: decryptedPassword },
        "Password fetched successfully!",
      ),
    );
});

export {
  addCredential,
  getCredentials,
  getCredentialById,
  updateCredentials,
  deleteCredential,
  revealPassword,
};
