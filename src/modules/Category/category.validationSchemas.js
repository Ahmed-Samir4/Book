import Joi from "joi";

export const addCategorySchema ={
    formData: Joi.object({
        name: Joi.string().length(3).required(),
    })
}

export const updateCategorySchema ={
    formData: Joi.object({
        name: Joi.string().required(),
        oldPublicId: Joi.string().required()
    }),
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}

export const deleteCategorySchema ={
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}

export const getCategorySchema ={
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}

// export const getAllCategoriesSchema ={
//     query : Joi.object({
//         page: Joi.number().min(1).required(),
//         size: Joi.number().min(1).required()
//     })
// }

export const getBooksSchema ={
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}