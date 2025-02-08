import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as userController from "./user.controller.js";
import { endPointsRoles } from "./user.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { updateUserSchema, deleteUserSchema, getUserDataSchema, softDeleteUserSchema ,updatePasswordSchema } from "./user.validationSchemas.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
const router = Router();



router.put('/:userId', auth(endPointsRoles.UPDATE_USER),
    validationMiddleware(updateUserSchema),
    expressAsyncHandler(userController.updateUser))

router.delete('/:userId', auth(endPointsRoles.DELETE_USER),
    validationMiddleware(deleteUserSchema),
    expressAsyncHandler(userController.deleteUser))
    
router.delete('/soft-delete/:userId', auth(endPointsRoles.SOFT_DELETE_USER),
    validationMiddleware(softDeleteUserSchema),
    expressAsyncHandler(userController.softDeleteUser))

router.get('/:userId', auth(endPointsRoles.GET_USER),
    validationMiddleware(getUserDataSchema),
    expressAsyncHandler(userController.getUserData))

router.put('/update-password/:userId', auth(endPointsRoles.UPDATE_PASSWORD),
    validationMiddleware(updatePasswordSchema),
    expressAsyncHandler(userController.updatePassword))


export default router;