import { Router } from 'express';
import {
  createUser,
  getLoginUser,
  loginUser,
  logoutUser,
} from '../controllers/user.controller.js';
import { jwtVerifyToken } from '../middlewares/authUser.middlewares.js';

const router = Router();

router.route('/create-user').post(createUser);
router.route('/login-user').post(loginUser);
router.route('/logout-user').get(jwtVerifyToken, logoutUser);
router.route('/get-userData').get(jwtVerifyToken, getLoginUser);

export default router;
