const mongoose = require('mongoose');
const { Schema } = mongoose;

const CalculationSchema = new Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    inveInicial: Number,
    averiaInicial: Number,
    recibidoInicial: Number,
    inveFinal: Number,
    venta: Number,
}, { _id: false });

const SalesCalculationLogSchema = new Schema({
    source: { type: String, enum: ['scheduled_job', 'manual_admin', 'unknown'], required: true },
    status: { type: String, enum: ['success', 'error'], required: true },
    targetDate: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    currentOrder: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
        date: Date,
        detailsCount: Number,
    },
    nextOrder: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
        date: Date,
        detailsCount: Number,
    },
    formula: { type: String, default: 'INVE inicial - AVER inicial + RECI inicial - INVE final' },
    calculations: { type: [CalculationSchema], default: [] },
    error: { type: String, default: null },
}, { timestamps: true });

SalesCalculationLogSchema.index({ targetDate: 1, shop: 1, createdAt: -1 });
SalesCalculationLogSchema.index({ source: 1, createdAt: -1 });

module.exports = mongoose.model('SalesCalculationLog', SalesCalculationLogSchema);
