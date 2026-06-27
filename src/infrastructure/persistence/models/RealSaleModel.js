const mongoose = require('mongoose');
const {Schema} = mongoose;

const ProductRealSaleDetailSchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        realSale: {
            type: Number,
            required: true,
            default: 0,
        },
        calculatedSale: {
            type: Number,
            required: true,
            default: 0,
        },
        unitDifference: {
            type: Number,
            required: true,
            default: 0,
        },
        percentageDifference: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {_id: false},
);

const CategoryRealSaleDetailSchema = new Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        realSale: {
            type: Number,
            required: true,
            default: 0,
        },
        calculatedSale: {
            type: Number,
            required: true,
            default: 0,
        },
        unitDifference: {
            type: Number,
            required: true,
            default: 0,
        },
        percentageDifference: {
            type: Number,
            required: true,
            default: 0,
        },
        products: {
            type: [ProductRealSaleDetailSchema],
            default: [],
        },
    },
    {_id: false},
);

const RealSaleSchema = new Schema({
    platformId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Platform',
        required: true,
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true,
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    categories: {
        type: [CategoryRealSaleDetailSchema],
        default: [],
    },
});

const RealSaleModel = mongoose.model('RealSale', RealSaleSchema);

module.exports = RealSaleModel;