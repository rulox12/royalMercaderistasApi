const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderDetailScheme = new Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    INVE: String,
    AVER: String,
    LOTE: String,
    RECI: String,
    PEDI: String,
    VENT: String,
    PEDI_REAL: String,
});

const OrderDetails = mongoose.model("OrderDetails", OrderDetailScheme);

module.exports = OrderDetails;