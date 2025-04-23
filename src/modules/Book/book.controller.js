import slugify from "slugify"
import fs from "fs"

import Book from "../../../DB/Models/book.model.js"
import User from "../../../DB/Models/user.model.js"
import Category from "../../../DB/Models/category.model.js"
import { systemRoles } from "../../utils/system-roles.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import generateUniqueString from "../../utils/generate-Unique-String.js"
import { APIFeatures } from "../../utils/api-features.js"


/**
 * @name addBook
 * @param {*} req body: {title, description, language, releaseDate, pages}
 * @param {*} req query: {categoryId, authorId}
 * @param {*} req authUser :{_id}
 * @returns the created Book data with status 201 and success message
 * @description add a Book to the database
 */
//================================= Add Book API =================================//
export const addBook = async (req, res, next) => {
    // data from the request body
    const { title, description, language, releaseDate, pages } = req.body
    // data from the request query
    const { categoryId, authorId } = req.query
    // data from the request authUser
    const addedBy = req.authUser._id

    // check if addedBy is not an author or admin
    if (![systemRoles.AUTHOR, systemRoles.ADMIN, systemRoles.SUPER_ADMIN].includes(req.authUser.role)) {
        return next({ cause: 403, message: 'You are not authorized to add a book' })
    }

    // category check
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // author check
    const author = await User.findById(authorId)
    if (!author) return next({ cause: 404, message: 'Author not found' })

    // book check
    const bookExists = await Book.findOne({ title, categoryId, authorId })
    if (bookExists) return next({ cause: 400, message: 'Book already exists' })

    // generate the book slug
    const slug = slugify(title, { lower: true, replacement: '-' })

    // Files check
    if (!req.files?.coverImage?.[0]) return next({ cause: 400, message: 'Cover image is required' })
    if (!req.files?.pdf?.[0]) return next({ cause: 400, message: 'PDF file is required' })

    const folderId = generateUniqueString(4)
    const folderPath = category.Image.public_id.split(`${category.folderId}/`)[0]

    // Upload cover image
    const { secure_url: coverImageSecureUrl, public_id: coverImagePublicId } = await cloudinaryConnection().uploader.upload(req.files.coverImage[0].path, {
        folder: folderPath + `${category.folderId}/Books/${folderId}/cover`
    })

    // Upload PDF
    const { secure_url: pdfSecureUrl, public_id: pdfPublicId } = await cloudinaryConnection().uploader.upload(req.files.pdf[0].path, {
        folder: folderPath + `${category.folderId}/Books/${folderId}/pdf`,
        resource_type: 'raw'
    })

    // Upload other images if exist
    const Images = []
    if (req.files?.images?.length) {
        for (const file of req.files.images) {
            const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
                folder: folderPath + `${category.folderId}/Books/${folderId}/images`
            })
            Images.push({ secure_url, public_id })
        }
    }

    req.folder = folderPath + `${category.folderId}/Books/${folderId}`

    // prepare the book object for db 
    const book = {
        title, description, slug, language, releaseDate, pages, categoryId, authorId, addedBy, 
        Images, folderId, categoryFolderId: category.folderId,
        coverImage: { secure_url: coverImageSecureUrl, public_id: coverImagePublicId },
        pdf: { secure_url: pdfSecureUrl, public_id: pdfPublicId }
    }

    const newBook = await Book.create(book)
    req.savedDocuments = { model: Book, _id: newBook._id }

    res.status(201).json({ success: true, message: 'Book created successfully', data: newBook })
}

/**
 * @name updateBook
 * @param {*} req body: {title, description, language, releaseDate, pages}
 * @param {*} req params : {bookId}
 * @param {*} req authUser :{_id}
 * @returns the updated book data with status 200 and success message
 * @description update a book in the database
 */
//================================================= Update Book API ============================================//
export const updateBook = async (req, res, next) => {
    // data from the request body
    const { title, description, language, releaseDate, pages } = req.body
    // data for condition
    const { bookId } = req.params
    // data from the request authUser
    const addedBy = req.authUser._id

    // check if addedBy is not an author or admin
    if (![systemRoles.AUTHOR, systemRoles.ADMIN, systemRoles.SUPER_ADMIN].includes(req.authUser.role)) {
        return next({ cause: 403, message: 'You are not authorized to update a book' })
    }

    // book Id  
    const book = await Book.findById(bookId)
    if (!book) return next({ cause: 404, message: 'Book not found' })

    // who will be authorized to update a book
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        book.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to update this book' })

    // title update
    if (title) {
        book.title = title
        book.slug = slugify(title, { lower: true, replacement: '-' })
    }
    if (description) book.description = description
    if (language) book.language = language
    if (releaseDate) book.releaseDate = releaseDate
    if (pages) book.pages = pages

    try {
        // Handle file updates
        const fileOperations = []

        // Update cover image if provided
        if (req.files?.coverImage?.[0]) {
            fileOperations.push(async () => {
                try {
                    // Upload new cover image
                    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.files.coverImage[0].path, {
                        folder: `${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}/cover`
                    })
                    book.coverImage = { secure_url, public_id }
                    console.log('Uploaded new cover image:', public_id)

                    // Clean up local file
                    fs.unlinkSync(req.files.coverImage[0].path)
                } catch (error) {
                    console.error('Error updating cover image:', error)
                    throw error
                }
            })
        }

        // Update PDF if provided
        if (req.files?.pdf?.[0]) {
            fileOperations.push(async () => {
                try {
                    // Upload new PDF
                    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.files.pdf[0].path, {
                        folder: `${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}/pdf`,
                        resource_type: 'raw'
                    })
                    book.pdf = { secure_url, public_id }
                    console.log('Uploaded new PDF:', public_id)

                    // Clean up local file
                    fs.unlinkSync(req.files.pdf[0].path)
                } catch (error) {
                    console.error('Error updating PDF:', error)
                    throw error
                }
            })
        }

        // Update other images if provided
        if (req.files?.images?.length) {
            fileOperations.push(async () => {
                try {
                    // Upload new images
                    for (const file of req.files.images) {
                        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
                            folder: `${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}/images`
                        })
                        book.Images.push({ secure_url, public_id })
                        console.log('Uploaded new image:', public_id)

                        // Clean up local file
                        fs.unlinkSync(file.path)
                    }
                } catch (error) {
                    console.error('Error updating images:', error)
                    throw error
                }
            })
        }

        // Execute all file operations
        await Promise.all(fileOperations.map(op => op()))

        // Save the book after all file operations are complete
        await book.save()

        res.status(200).json({ success: true, message: 'Book updated successfully', data: book })
    } catch (error) {
        console.error('Error in updateBook:', error)
        
        // Clean up any remaining local files
        if (req.files?.coverImage?.[0] && fs.existsSync(req.files.coverImage[0].path)) {
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        if (req.files?.pdf?.[0] && fs.existsSync(req.files.pdf[0].path)) {
            fs.unlinkSync(req.files.pdf[0].path)
        }
        if (req.files?.images?.length) {
            for (const file of req.files.images) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path)
                }
            }
        }

        return next({ cause: 500, message: 'Error updating book files', error: error.message })
    }
}

/**
 * @name deleteBook
 * @param {*} req params : {bookId}
 * @param {*} req authUser :{_id}
 * @returns the deleted book data with status 200 and success message
 * @description delete a book from the database
 */
//================================================= Delete Book API ============================================//
export const deleteBook = async (req, res, next) => {
    const { bookId } = req.params
    const addedBy = req.authUser._id

    // check if addedBy is not an author or admin
    if (![systemRoles.AUTHOR, systemRoles.ADMIN, systemRoles.SUPER_ADMIN].includes(req.authUser.role)) {
        return next({ cause: 403, message: 'You are not authorized to delete a book' })
    }

    // Find the book first to get its file information
    const book = await Book.findById(bookId)
    if (!book) return next({ cause: 404, message: 'Book not found' })

    // Check authorization
    if (
        req.authUser.role !== systemRoles.SUPER_ADMIN &&
        book.addedBy.toString() !== addedBy.toString()
    ) return next({ cause: 403, message: 'You are not authorized to delete this book' })

    try {
        const bookFolderPath = `${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}`
        
        try {
            // Delete all files individually first
            const deleteOperations = []

            // Delete cover image if exists
            if (book.coverImage?.public_id) {
                deleteOperations.push(
                    cloudinaryConnection().uploader.destroy(book.coverImage.public_id)
                )
            }

            // Delete PDF if exists
            if (book.pdf?.public_id) {
                deleteOperations.push(
                    cloudinaryConnection().uploader.destroy(book.pdf.public_id, { resource_type: 'raw' })
                )
            }

            // Delete all images if exist
            if (book.Images?.length) {
                for (const image of book.Images) {
                    if (image.public_id) {
                        deleteOperations.push(
                            cloudinaryConnection().uploader.destroy(image.public_id)
                        )
                    }
                }
            }

            // Execute all file deletions
            await Promise.all(deleteOperations)
            console.log('All files deleted successfully')

            // Now delete the folders
            const folderOperations = []

            // Delete the book's specific folders
            folderOperations.push(
                cloudinaryConnection().api.delete_folder(`${bookFolderPath}/cover`),
                cloudinaryConnection().api.delete_folder(`${bookFolderPath}/pdf`),
                cloudinaryConnection().api.delete_folder(`${bookFolderPath}/images`)
            )

            // Execute folder deletions
            await Promise.all(folderOperations)
            console.log('All subfolders deleted successfully')

            // Finally delete the main book folder
            await cloudinaryConnection().api.delete_folder(bookFolderPath)
            console.log('Main book folder deleted successfully')

        } catch (cloudinaryError) {
            console.error('Error in Cloudinary operations:', cloudinaryError)
            // Continue with database deletion even if Cloudinary operations fail
        }

        // Delete the book from database
        const deletedBook = await Book.findByIdAndDelete(bookId)
        if (!deletedBook) {
            throw new Error('Failed to delete book from database')
        }

        res.status(200).json({ 
            success: true, 
            message: 'Book deleted successfully',
            data: {
                _id: book._id,
                title: book.title
            }
        })
    } catch (error) {
        console.error('Error in deleteBook:', error)
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            bookId,
            bookFolderPath: `${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}`
        })
        return next({ 
            cause: 500, 
            message: 'Error deleting book', 
            error: error.message,
            details: error.stack
        })
    }
}



/**
 * @name getAllBooks
 * @param {*} req query: {page, size, sort, ...search}
 * @returns all books with status 200 and success message
 * @description get all books from the database
 */
//================================= Get All Books API =================================//
export const getAllBooks = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query
    const features = new APIFeatures(req.query, Book.find())
        .sort(sort)
        .pagination({ page, size })
        .search(search)
        .filters(search)

    // Populate author and category information
    features.mongooseQuery = features.mongooseQuery
        .populate({ 
            path: 'authorId', 
            select: 'username email profileImage' 
        })
        .populate({ 
            path: 'categoryId', 
            select: 'name description' 
        })
        .select('-__v -createdAt -updatedAt -folderId -categoryFolderId')

    const books = await features.mongooseQuery
    
    res.status(200).json({ 
        success: true, 
        data: books,
        pagination: {
            page: parseInt(page) || 1,
            size: parseInt(size) || 10,
            total: await Book.countDocuments(features.mongooseQuery._conditions)
        }
    })
}

/**
 * @name getBook
 * @param {*} req params : {bookId}
 * @returns the book data with status 200 and success message
 * @description get a book from the database
 */
//================================= Get Book API =================================//
export const getBookById = async (req, res, next) => {
    const { bookId } = req.params

    const book = await Book.findById(bookId)
        .populate({ 
            path: 'authorId', 
            select: 'username email profileImage description age' 
        })
        .populate({ 
            path: 'categoryId', 
            select: 'name description' 
        })
        .select('-__v -createdAt -updatedAt -folderId -categoryFolderId')

    if (!book) return next({ cause: 404, message: 'Book not found' })

    res.status(200).json({ 
        success: true, 
        data: book 
    })
}