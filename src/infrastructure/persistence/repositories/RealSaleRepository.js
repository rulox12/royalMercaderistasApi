const RealSaleModel = require('../models/RealSaleModel');

class RealSaleRepository {
    async create(realSale) {
        const newRealSale = new RealSaleModel(realSale);
        await newRealSale.save();
        return newRealSale.toObject();
    }

    async update(realSaleId, updatedFields) {
        return RealSaleModel.findByIdAndUpdate(realSaleId, updatedFields, {
            new: true,
        });
    }

    async findById(realSaleId) {
        return RealSaleModel.findById(realSaleId).exec();
    }

    async findOneByScope({ platformId, cityId, shopId, startDate, endDate }) {
        return RealSaleModel.findOne({
            platformId,
            cityId,
            shopId,
            startDate,
            endDate,
        }).exec();
    }
}

module.exports = RealSaleRepository;