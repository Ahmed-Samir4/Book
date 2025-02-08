import Joi from "joi";

export const addProductSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().required(),
        desc: Joi.string().required(),
        basePrice: Joi.number().required(),
        discount: Joi.number().required(),
        stock: Joi.number().required(),
        specs: Joi.string().required(),
    }),
    query: Joi.object({
        categoryId: Joi.string().hex().length(24).required(),
        subCategoryId: Joi.string().hex().length(24).required(),
        brandId: Joi.string().hex().length(24).required(),
    }),
});

export const updateProductSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().optional(),
        desc: Joi.string().optional(),
        basePrice: Joi.number().optional(),
        discount: Joi.number().optional(),
        stock: Joi.number().optional(),
        specs: Joi.string().optional(),
        oldPublicId: Joi.string().optional(),
    }),
    params: Joi.object({
        productId: Joi.string().hex().length(24).required()
    }),
});

export const getAllProductsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        sortBy: Joi.string().optional(),
    })
});
