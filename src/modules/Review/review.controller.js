import Order from '../../../DB/Models/order.model.js'
import Product from '../../../DB/Models/product.model.js'
import Review from '../../../DB/Models/review.model.js'
import { updateRate } from './utils/updateRate.js'

/**
 * @name addReview
 * @query productId
 * @body reviewRate, reviewComment
 * @description add review to the product if the user bought the product before and didn't review it before and update the product rate
 */
export const addReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.query

    // 1- check if the user bought the product before
    const isProductValidToBeReviewed = await Order.findOne({
        user: userId,
        'orderItems.product' : productId,
        orderStatus: 'Delivered',
    })
    if (!isProductValidToBeReviewed) {
        return next(new Error('you should buy the product first', { cause: 400 }))
    }
    // 2- check if the user reviewed the product before
    const isProductReviewedBefore = await Review.findOne({
        userId,
        productId,
    })
    if (isProductReviewedBefore) {
        return next(new Error('you reviewed the product before', { cause: 400 }))
    }
    // 3- add the review
    const { reviewRate, reviewComment } = req.body;
    const reviewObject = {
        userId,
        productId,
        reviewComment,
        reviewRate,
    }  
    const review = await Review.create(reviewObject)
    if (!review) {
        return next(new Error('failed to add the review', { cause: 500 }))
    }
    // 4- update the product rate
    const product = await Product.findById(productId)
    product.rate = await updateRate(productId)
    await product.save()

    res.status(201).json({
        status: 'success',
        data: review,
    })
}

/**
 * @name deleteReview
 * @query productId
 * @description delete the review of the product and update the product rate
 */
export const deleteReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.query
    // 1- delete the review
    const review = await Review.findOneAndDelete({ userId, productId })
    if (!review) {
        return next(new Error('failed to delete the review', { cause: 500 }))
    }
    // 2- update the product rate
    const product = await Product.findById(productId)
    product.rate = await updateRate(productId)
    await product.save()

    res.status(200).json({
        status: 'success',
        data: review,
    })
}

/**
 * @name getReviews
 * @query productId
 * @description get the reviews of the specific product
 */
export const getReviews = async (req, res, next) => {
    const { productId } = req.query
    const reviews = await Review.find({ productId }).populate('userId', 'name email')
    res.status(200).json({
        status: 'success',
        data: reviews,
    })
}