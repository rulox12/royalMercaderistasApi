const mongoose = require('mongoose');
const { Schema } = mongoose;

const BigOrderSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    cityId: {
        type: String,
        ref: "City",
        required: true
    },
    platformId: {
        type: String,
        ref: "Platform",
    },
});

BigOrderSchema.pre('findOne', function(next) {
    if (this._conditions.date) {
        // Si la fecha está en formato YYYY-MM-DD, conviértela a rango de fechas ISO8601
        if (/^\d{4}-\d{2}-\d{2}$/.test(this._conditions.date)) {
            const date = new Date(this._conditions.date);
            const startDate = new Date(date.setUTCHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(date.setUTCHours(23, 59, 59, 999)).toISOString();
            this._conditions.date = { $gte: startDate, $lte: endDate };
        }
    }
    next();
});

BigOrderSchema.pre('find', function(next) {
    if (this._conditions.date) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(this._conditions.date)) {
            const date = new Date(this._conditions.date);
            const startDate = new Date(date.setUTCHours(0, 0, 0, 0)).toISOString();
            const endDate = new Date(date.setUTCHours(23, 59, 59, 999)).toISOString();
            this._conditions.date = { $gte: startDate, $lte: endDate };
        }
    }
    next();
});

const BigOrderModel = mongoose.model('BigOrder', BigOrderSchema);

module.exports = BigOrderModel;
