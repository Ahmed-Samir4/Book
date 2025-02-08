import Joi from "joi";

export const addReviewSchema = Joi.object({
    body: Joi.object({
        reviewRate: Joi.number().required().min(1).max(5),
        reviewComment: Joi.string().required(),
    }),
    query: Joi.object({
        productId: Joi.string().required(),
    })
})

export const deleteReviewSchema = Joi.object({
    query: Joi.object({
        productId: Joi.string().required(),
    })
})

export const getReviewsSchema = Joi.object({
    query: Joi.object({
        productId: Joi.string().required(),
    })
})