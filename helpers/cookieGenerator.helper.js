import jwt from 'jsonwebtoken';

const generateRefreshCookieToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  return token;
};

const generateAccessCookieToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return token;
};

export { generateRefreshCookieToken, generateAccessCookieToken };
