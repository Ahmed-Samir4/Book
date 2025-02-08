import Joi from "joi";

export const signUpSchema = Joi.object({
    body: Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        age: Joi.number().min(18).max(100).required(),
        role: Joi.string().valid('user', 'admin' ,'superAdmin' ,'deliver'),
        phoneNumbers: Joi.array().items(Joi.string().required()),
        addresses: Joi.array().items(Joi.string().required())
    })
})

export const signInSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    })
})

export const verifyEmailSchema = Joi.object({
    query: Joi.object({
        token: Joi.string().required()
    })
})

export const forgetPasswordSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required()
    })
})

export const resetPasswordSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        forgetCode: Joi.string().required(),
        newPassword: Joi.string().min(8).required()
    })
})