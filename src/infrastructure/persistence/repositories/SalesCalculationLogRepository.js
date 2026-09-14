const SalesCalculationLogModel = require('../models/SalesCalculationLogModel');

class SalesCalculationLogRepository {
    async create(log) {
        const created = await SalesCalculationLogModel.create(log);
        return created.toObject();
    }

    async find(filters = {}, limit = 100) {
        return SalesCalculationLogModel.find(filters)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('shop', 'name shopNumber')
            .populate('calculations.product', 'name displayName internalProductNumber presentation')
            .lean()
            .exec();
    }
}

module.exports = SalesCalculationLogRepository;
