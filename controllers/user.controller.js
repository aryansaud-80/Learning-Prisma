import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { prisma } from '../config/db.config.js';
import { comparePassword, hashPassword } from '../helpers/bcrypt.helper.js';
import { option } from '../constant.js';
import {
  generateRefreshCookieToken,
  generateAccessCookieToken,
} from '../helpers/cookieGenerator.helper.js';

export const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => !field)) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }],
    },
  });

  if (user) {
    throw new ApiError(400, 'User already exists');
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: await hashPassword(password),
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!newUser) {
    throw new ApiError(500, 'Error creating user');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, 'User created successfully', newUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => !field)) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const refreshToken = await generateRefreshCookieToken(user.id);
  const accessToken = await generateAccessCookieToken(user.id);

  console.log('refreshToken', refreshToken);
  console.log('accessToken', accessToken);

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!updatedUser) {
    throw new ApiError(500, 'Error updating user');
  }

  return res
    .status(200)
    .cookie('refreshToken', refreshToken, option)
    .cookie('accessToken', accessToken, option)
    .json(
      new ApiResponse(200, 'Login successful', {
        updatedUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(400, 'No token provided');
  }

  const user = await prisma.user.findFirst({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: null,
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!updatedUser) {
    throw new ApiError(500, 'Error updating user');
  }

  return res
    .status(200)
    .clearCookie('refreshToken', option)
    .clearCookie('accessToken', option)
    .json(new ApiResponse(200, 'Logout successful', updatedUser));
});

export const getLoginUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, 'Please login first!');
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select:{
      id: true,
      username: true,
      email: true,
    }
  });

  if (!userData) {
    throw new ApiError(401, 'You are not login? Please login first bro!');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, 'You successfully fetched the user data', userData)
    );
});
