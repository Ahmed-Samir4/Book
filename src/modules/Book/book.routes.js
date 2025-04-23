import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as bookController from './book.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './book.endpoints.js'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import { addBookSchema, getAllBooksSchema, updateBookSchema } from './book.validationSchemas.js'

const router = Router()

router.post('/',
    auth(endPointsRoles.ADD_BOOK),
    multerMiddleHost([
        { name: 'coverImage', maxCount: 1, extensions: allowedExtensions.image },
        { name: 'images', maxCount: 10, extensions: allowedExtensions.image },
        { name: 'pdf', maxCount: 1, extensions: allowedExtensions.document }
    ]),
    validationMiddleware(addBookSchema),
    expressAsyncHandler(bookController.addBook)
)

router.put('/:bookId',
    auth(endPointsRoles.ADD_BOOK),
    multerMiddleHost([
        { name: 'coverImage', maxCount: 1, extensions: allowedExtensions.image },
        { name: 'images', maxCount: 10, extensions: allowedExtensions.image },
        { name: 'pdf', maxCount: 1, extensions: allowedExtensions.document }
    ]),
    validationMiddleware(updateBookSchema),
    expressAsyncHandler(bookController.updateBook)
)

router.get('/',
    validationMiddleware(getAllBooksSchema),
    expressAsyncHandler(bookController.getAllBooks)
)

router.get('/:bookId',
    expressAsyncHandler(bookController.getBookById)
)

router.delete('/:bookId',
    auth(endPointsRoles.ADD_BOOK),
    expressAsyncHandler(bookController.deleteBook)
)

export default router
