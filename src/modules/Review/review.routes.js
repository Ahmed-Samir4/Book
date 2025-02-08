import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as reviewController from "./review.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Review/review.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { addReviewSchema , deleteReviewSchema ,getReviewsSchema} from "./review.validationSchemas.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
const router = Router();

router.post('/',
    auth(endPointsRoles.ADD_REVIEW),
    validationMiddleware(addReviewSchema),
    expressAsyncHandler(reviewController.addReview)
);

router.delete('/', 
    auth(endPointsRoles.DELETE_REVIEW),
    validationMiddleware(deleteReviewSchema),
    expressAsyncHandler(reviewController.deleteReview)
);

router.get('/',
    validationMiddleware(getReviewsSchema),
    expressAsyncHandler(reviewController.getReviews)
);
export default router;