// function to update the rate of a review

import reviewModel from "../../../../DB/Models/review.model.js"

export const updateRate = async (productId) => {
    const reviews = await reviewModel.find({ productId })
    let sumOfRates = 0
    for (const review of reviews) {
        sumOfRates += review.reviewRate
    }
    const averageRate = Number(sumOfRates / reviews.length).toFixed(2)
    return averageRate
}
