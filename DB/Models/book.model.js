import mongoose, { Schema, model } from "mongoose";

const BookSchema = new Schema({
    /** String */
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },  /** @todo make the slug in lowercase */
    description: { type: String, required: true, trim: true },
    folderId: { type: String, required: true, unique: true },
    language: { type: String, required: true, trim: true },
    releaseDate: { type: Date, required: true, trim: true },
    pages: { type: String, required: true, trim: true },

    /** Arrays */
    Images: [{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true }
    }],


    /** ObjectIds */
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BookSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'bookId'
})

export default mongoose.models.Book || model('Book', BookSchema)

