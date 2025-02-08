
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as authController from './auth.controller.js';
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {forgetPasswordSchema, signInSchema , signUpSchema , verifyEmailSchema} from "./auth.validationSchemas.js"
const router = Router();


router.post('/', validationMiddleware(signUpSchema), expressAsyncHandler(authController.signUp))
router.get('/verify-email', validationMiddleware(verifyEmailSchema), expressAsyncHandler(authController.verifyEmail))
router.get('/refresh-token', validationMiddleware(verifyEmailSchema), expressAsyncHandler(authController.refreshToken))
router.post('/forget-password', validationMiddleware(forgetPasswordSchema), expressAsyncHandler(authController.forgotPassword))
router.post('/reset-password', validationMiddleware(forgetPasswordSchema), expressAsyncHandler(authController.resetPassword))
router.post('/login',validationMiddleware(signInSchema), expressAsyncHandler(authController.signIn))



export default router;