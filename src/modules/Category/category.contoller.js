import slugify from 'slugify'

import Category from '../../../DB/Models/category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import Book from '../../../DB/Models/book.model.js'
import { APIFeatures } from '../../utils/api-features.js'


/** 
 * @name addCategory
 * @param name
 * @description add new category after checking if the category name is already exist and upload the image to cloudinary
*/
export const addCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { _id } = req.authUser

    // 2- check if the category name is already exist
    const isNameDuplicated = await Category.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'Category name is already exist' })
    }

    // 3- generate the slug
    const slug = slugify(name, '-')

    // 4- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`
    })

    req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`

    // 5- generate the category object
    const category = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id
    }
    // 6- create the category
    const categoryCreated = await Category.create(category)
    req.savedDocuments = { model: Category, _id: categoryCreated._id }


    // const x = 8
    // x = 7

    res.status(201).json({ success: true, message: 'Category created successfully', data: categoryCreated })
}


/**
 * @name updateCategory
 * @param name
 * @param oldPublicId
 * @description update category name and image if exists by using oldPublicId to overwrite the old image in cloudinary
 *  */
export const updateCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name, oldPublicId } = req.body
    // 2- destructuring the request params 
    const { categoryId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the category is exist bu using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 5- check if the use want to update the name field
    if (name) {
        // 5.1 check if the new category name different from the old name
        if (name == category.name) {
            return next({ cause: 400, message: 'Please enter different category name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await Category.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 update the category name and the category slug
        category.name = name
        category.slug = slugify(name, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${category.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
            public_id: newPulicId
        })

        category.Image.secure_url = secure_url
    }


    // 7- set value for the updatedBy field
    category.updatedBy = _id

    await category.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category })
}


/**
 * @name getAllCategories
 * @description get all categories and the related subcategories, brands, products and use pagination
 */
export const getAllCategories = async (req, res, next) => {
    const { page, size, sortBy } = req.query
    // nested populate
    const features = new APIFeatures(req.query, Category.find()).pagination({ page, size }).sort(sortBy)

    // populate books in the category 
    const categories = await features.mongooseQuery.populate('books')
    // console.log(categories);
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: categories })
}

/**
 * @name deleteCategory
 * @param categoryId
 * @description delete category and the related subcategories, brands, products and the category folder from cloudinary
 */
export const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params

    // 1- delete category
    const category = await Category.findByIdAndDelete(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 2- delete the related books
    const products = await Book.deleteMany({ categoryId })
    if (products.deletedCount <= 0) {
        console.log(products.deletedCount);
        console.log('There is no related Books');
    }

    // 3- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${category.folderId}`)

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}

/**
 * @name getCategory
 * @param categoryId
 * @description get category by using categoryId and populate the subcategories, brands and products and use search
 */
export const getCategory = async (req, res, next) => {
    const { categoryId } = req.params
    const features = new APIFeatures(req.query, Category.findById(categoryId))
    
    const category = await features.mongooseQuery.populate('books')
    if (!category) return next({ cause: 404, message: 'Category not found' })
    res.status(200).json({ success: true, message: 'Category fetched successfully', data: category })
}


/**
 * @name getBooksByCategory
 * @param categoryId
 * @description get books by category and use pagination
 */
export const getBooksByCategory = async (req, res, next) => {
    const { categoryId } = req.params
    const { page, size, sortBy } = req.query
    const features = new APIFeatures(req.query, Book.find({ categoryId })).pagination({ page, size }).sort(sortBy)
    const books = await features.mongooseQuery
    res.status(200).json({ success: true, message: 'Books fetched successfully', data: books })

}
