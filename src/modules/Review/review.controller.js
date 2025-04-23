import Book from '../../../DB/Models/book.model.js'
import Review from '../../../DB/Models/review.model.js'
import { updateRate } from './utils/updateRate.js'

/**
 * @name addReview
 * @query bookId
 * @body reviewRate, reviewComment
 * @description Add a review to a book if the user hasn't reviewed it before and update the book's rating
 */
export const addReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { bookId } = req.query
    const { reviewRate, reviewComment } = req.body

    // Check if the book exists
    const book = await Book.findById(bookId)
    if (!book) {
        return next(new Error('Book not found', { cause: 404 }))
    }

    // Check if the user has already reviewed this book
    const existingReview = await Review.findOne({
        userId,
        bookId
    })
    if (existingReview) {
        return next(new Error('You have already reviewed this book', { cause: 400 }))
    }

    // Create the review
    const review = await Review.create({
        userId,
        bookId,
        reviewRate,
        reviewComment
    })
    if (!review) {
        return next(new Error('Failed to add review', { cause: 500 }))
    }

    // Update book rating using the utility function
    const newRate = await updateRate(bookId)
    book.rate = newRate
    await book.save()

    res.status(201).json({
        status: 'success',
        message: 'Review added successfully',
        data: review
    })
}

/**
 * @name deleteReview
 * @query bookId
 * @description Delete a review and update the book's rating
 */
export const deleteReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { bookId } = req.query

    // Check if the book exists
    const book = await Book.findById(bookId)
    if (!book) {
        return next(new Error('Book not found', { cause: 404 }))
    }

    // Delete the review
    const review = await Review.findOneAndDelete({ userId, bookId })
    if (!review) {
        return next(new Error('Review not found', { cause: 404 }))
    }

    try {
        // Update book rating using the utility function
        const newRate = await updateRate(bookId)
        book.rate = newRate
        await book.save()

        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully',
            data: review
        })
    } catch (error) {
        console.error('Error updating book rate:', error)
        // Even if rate update fails, still return success for review deletion
        res.status(200).json({
            status: 'success',
            message: 'Review deleted successfully',
            data: review
        })
    }
}

/**
 * @name getReviews
 * @query bookId
 * @description Get all reviews for a specific book with user details
 */
export const getReviews = async (req, res, next) => {
    const { bookId } = req.query

    // Check if the book exists
    const book = await Book.findById(bookId)
    if (!book) {
        return next(new Error('Book not found', { cause: 404 }))
    }

    const reviews = await Review.find({ bookId })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .select('-__v -updatedAt')

    res.status(200).json({
        status: 'success',
        data: reviews
    })
}