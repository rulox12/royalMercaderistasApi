const mongoose = require('mongoose');
const { Schema } = mongoose;

const BigOrderScheme = new Schema({
    date: {
        type: String,
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
    }
});

const BigOrderModel = mongoose.model('BigOrder', BigOrderScheme);

module.exports = BigOrderModel;
