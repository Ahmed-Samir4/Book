
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as categoryController from './category.contoller.js'
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "./category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { addCategorySchema, deleteCategorySchema, updateCategorySchema ,getCategorySchema ,getBooksSchema } from "./category.validationSchemas.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import { get } from "mongoose";

const router = Router();
router.post('/',
    auth(endPointsRoles.ADD_CATEGORY),
    validationMiddleware(addCategorySchema),
    multerMiddleHost([
        { name: 'image', maxCount: 1, extensions: allowedExtensions.image }
    ]),
    expressAsyncHandler(categoryController.addCategory))

router.put('/:categoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    validationMiddleware(updateCategorySchema),
    multerMiddleHost([
        { name: 'image', maxCount: 1, extensions: allowedExtensions.image }
    ]),
    expressAsyncHandler(categoryController.updateCategory))

router.get('/:categoryId',
    validationMiddleware(getCategorySchema),
    expressAsyncHandler(categoryController.getCategory))

router.get('/:categoryId/books',
    validationMiddleware(getBooksSchema),
    expressAsyncHandler(categoryController.getBooksByCategory))   

router.get('/', expressAsyncHandler(categoryController.getAllCategories))

router.delete('/:categoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    validationMiddleware(deleteCategorySchema),
    expressAsyncHandler(categoryController.deleteCategory))
export default router;