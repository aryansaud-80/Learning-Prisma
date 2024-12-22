import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/db.config.js';



const jwtVerifyToken = async (req, _, next) => {
  try {
    const { accessToken } = req.cookies || req.headers['authorization'].slice('Bearer ').join('');
  
    if(!accessToken){
      throw new ApiError(401, 'Access token is required');
    }
  
    const decodedJwt = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await prisma.user.findUnique({
      where: {
        id: decodedJwt.id,
      },
    })
  
    if(!user){
      throw new ApiError(401, 'Unauthorized');
    }
  
    req.user = user;
  
    next();
  } catch (error) {
    throw new ApiError(401, `unauthorized: ${error.message}`);
  }
}

export { jwtVerifyToken };