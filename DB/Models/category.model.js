import mongoose, { Schema, model } from "mongoose"


//============================== create the category schema ==============================//
const categorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, trim: true },
        Image: {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true, unique: true }
        },
        folderId: { type: String, required: true, unique: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // superAdmin
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // superAdmin
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

// // virtual populate for subCategories model
// categorySchema.virtual('subcategories', {
//     ref: 'SubCategory',
//     localField: '_id',
//     foreignField: 'categoryId',
//     // justOne: true
// })

export default mongoose.models.Category || model('Category', categorySchema)


