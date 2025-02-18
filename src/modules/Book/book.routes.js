import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as bookController from './book.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './book.endpoints.js'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import { addBookSchema,getAllBooksSchema,updateBookSchema} from './book.validationSchemas.js'
const router = Router()



router.post('/',
    auth(endPointsRoles.ADD_BOOK),
    multerMiddleHost({ extensions: allowedExtensions.image }).array('image', 3),
    validationMiddleware(addBookSchema),
    expressAsyncHandler(bookController.addBook)
)


router.put('/:bookId',
    auth(endPointsRoles.ADD_BOOK),
    multerMiddleHost({ extensions: allowedExtensions.image }).single('image'),
    validationMiddleware(updateBookSchema),
    expressAsyncHandler(bookController.updateBook)
)

router.get('/',
    validationMiddleware(getAllBooksSchema),
    expressAsyncHandler(bookController.getAllBooks)
)


export default router
