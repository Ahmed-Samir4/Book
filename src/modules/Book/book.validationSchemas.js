import Joi from "joi";

export const addBookSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        language: Joi.string().required(),
        releaseDate: Joi.date().required(),
        pages: Joi.string().required(),
    }),
    query: Joi.object({
        categoryId: Joi.string().hex().length(24).required(),
        authorId: Joi.string().hex().length(24).required(),
    }),
    files: Joi.object({
        coverImage: Joi.array().items(Joi.object()).length(1).required(),
        images: Joi.array().items(Joi.object()).optional(),
        pdf: Joi.array().items(Joi.object()).length(1).required(),
    }).required(),
});

export const updateBookSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        language: Joi.string().optional(),
        releaseDate: Joi.date().optional(),
        pages: Joi.string().optional(),
        oldPublicId: Joi.string().optional(),
    }),
    params: Joi.object({
        bookId: Joi.string().hex().length(24).required()
    }),
    files: Joi.object({
        coverImage: Joi.array().items(Joi.object()).length(1).optional(),
        images: Joi.array().items(Joi.object()).optional(),
        pdf: Joi.array().items(Joi.object()).length(1).optional(),
    }).optional(),
});

export const getAllBooksSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().optional(),
        size: Joi.number().optional(),
        sortBy: Joi.string().optional(),
    })
});

export const getSpecialBookSchema = Joi.object({
    params: Joi.object({
        bookId: Joi.string().hex().length(24).required()
    })
});

export const updateSpecialBookPagesSchema = Joi.object({
    params: Joi.object({
        bookId: Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
        pages: Joi.array().items(
            Joi.object({
                page: Joi.number().required(),
                text: Joi.string().required()
            })
        ).required(),
        authorId: Joi.string().hex().length(24).required()
    })
});
