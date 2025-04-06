import slugify from "slugify"

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

    // Images
    if (!req.files?.length) return next({ cause: 400, message: 'Images are required' })
    const Images = []
    const folderId = generateUniqueString(4)
    const folderPath = category.Image.public_id.split(`${category.folderId}/`)[0]

    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(file.path, {
            folder: folderPath + `${category.folderId}/Books/${folderId}`
        })
        Images.push({ secure_url, public_id })
    }
    req.folder = folderPath + `${category.folderId}/Books/${folderId}`

    // Cover Image
    const coverImage = Images[0].secure_url

    // prepare the book object for db 
    const book = {
        title, description, slug, language, releaseDate, pages, categoryId, authorId, addedBy, Images, folderId, coverImage , categoryFolderId: category.folderId
    }

    const newBook = await Book.create(book)
    req.savedDocuments = { model: Book, _id: newBook._id }

    res.status(201).json({ success: true, message: 'Book created successfully', data: newBook })
}

/**
 * @name updateBook
 * @param {*} req body: {title, description, language, releaseDate, pages, oldPublicId} 
 * @param {*} req params : {bookId}
 * @param {*} req authUser :{_id}
 * @returns the updated book data with status 200 and success message
 * @description update a book in the database
 */
//================================================= Update Book API ============================================//
export const updateBook = async (req, res, next) => {
    // data from the request body
    const { title, description, language, releaseDate, pages, oldPublicId } = req.body
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

    if (oldPublicId) {
        if (!req.files) return next({ cause: 400, message: 'Please select new image' })

        const folderPath = book.Images[0].public_id.split(`${book.folderId}/`)[0]
        const newPublicId = oldPublicId.split(`${book.folderId}/`)[1]

        console.log(folderPath, newPublicId);
        

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.files.path, {
            folder: folderPath + `${book.folderId}`,
            public_id: newPublicId
        })
        book.Images.map((img) => {
            if (img.public_id === oldPublicId) {
                img.secure_url = secure_url
            }
        })
        req.folder = folderPath + `${book.folderId}`

        // Update cover image if it was the old cover image
        if (book.coverImage === oldPublicId) {
            book.coverImage = secure_url
        }
    }

    await book.save()

    res.status(200).json({ success: true, message: 'Book updated successfully', data: book })
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

    // data for condition
    const { bookId } = req.params
    // data from the request authUser
    const addedBy = req.authUser._id

    // check if addedBy is not an author or admin
    if (![systemRoles.AUTHOR, systemRoles.ADMIN, systemRoles.SUPER_ADMIN].includes(req.authUser.role)) {
        return next({ cause: 403, message: 'You are not authorized to delete a book' })
    }

    // book Id  
    const book = await Book.findByIdAndDelete(bookId)   
    if (!book) return next({ cause: 404, message: 'Book not found' })


    // Remove images from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${book.categoryFolderId}/Books/${book.folderId}`)


    

    res.status(200).json({ success: true, message: 'Book deleted successfully', data: book })
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

    // const books = await features.mongooseQuery.populate([{
    //     path: 'reviews',
    // }])

    //return name of the author and category
    features.mongooseQuery = features.mongooseQuery
        .populate({ path: 'authorId', select: 'username' })
        .populate({ path: 'categoryId', select: 'name' })
        // .populate({ path: 'reviews', select: 'name' })
        .select('-__v -createdAt -updatedAt -Images -folderId -addedBy -categoryFolderId ')

        
    const books = await features.mongooseQuery
    
    res.status(200).json({ success: true, data: books })
}

/**
 * @name getBook
 * @param {*} req params : {bookId}
 * @returns the book data with status 200 and success message
 * @description get a book from the database
 */
//================================= Get Book API =================================//
export const getBookById = async (req, res, next) => {
    // data for condition
    const { bookId } = req.params

    // book Id  
    const book = await Book.findById(bookId)
        .populate({ path: 'authorId' , select: 'username description age' })
        .populate({ path: 'categoryId', select: 'name' })
        .select('-__v -createdAt -updatedAt')
    if (!book) return next({ cause: 404, message: 'Book not found' })

    res.status(200).json({ success: true, data: book })
}