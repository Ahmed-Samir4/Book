import Joi from "joi";


export const updateUserSchema ={
    body: Joi.object({
        username: Joi.string(),
        fullName: Joi.string().min(3).max(20),
        email: Joi.string(),
        age: Joi.number(),
        role: Joi.string(),
        phoneNumbers: Joi.array(),
        addresses: Joi.array(),
        description: Joi.string()
    }),
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const deleteUserSchema ={
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const softDeleteUserSchema ={
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const getUserDataSchema ={
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const updatePasswordSchema ={
    params : Joi.object({
        userId : Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required()
    })
}

export const updateProfileImageSchema = {
    params: Joi.object({
        userId: Joi.string().length(24).hex().required()
    })
}

export const getAllAuthorsSchema = {
    params: Joi.object({}).optional(),
    query: Joi.object({}).optional(),
    body: Joi.object({}).optional()
}