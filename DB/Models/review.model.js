import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User id is required']
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book id is required']
    },
    reviewRate: {
        type: Number,
        required: [true, 'Review rate is required'],
        min: [1, 'Review rate must be greater than or equal 1'],
        max: [5, 'Review rate must be less than or equal 5']
    },
    reviewComment: {
        type: String,
    },
}, {
    timestamps: true
})

export default mongoose.models.Review || mongoose.model('Review', reviewSchema)