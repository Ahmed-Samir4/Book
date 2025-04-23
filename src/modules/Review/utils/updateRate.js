// function to update the rate of a review

import Review from '../../../../DB/Models/review.model.js'

export const updateRate = async (bookId) => {
    try {
        // Get all reviews for the book
        const reviews = await Review.find({ bookId })
        
        // If there are no reviews, return 0
        if (!reviews.length) {
            return 0
        }

        // Calculate the average rate
        const totalRate = reviews.reduce((sum, review) => sum + review.reviewRate, 0)
        const averageRate = totalRate / reviews.length

        // Round to 1 decimal place
        return Math.round(averageRate * 10) / 10
    } catch (error) {
        console.error('Error in updateRate:', error)
        return 0 // Return 0 if there's an error
    }
}
