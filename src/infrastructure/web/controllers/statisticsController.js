const StatisticsHome = require('../../../application/useCases/statistics/statisticsHome');
const RunFullProcessUseCase = require('../../../application/useCases/statistics/runFullProcess');
const SalesCalculationLogRepository = require('../../../infrastructure/persistence/repositories/SalesCalculationLogRepository');

const salesCalculationLogRepository = new SalesCalculationLogRepository();

const statisticsController = {
    getHome: async (req, res) => {
        try {
            const response =  await StatisticsHome.execute();
            res.json(response)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    runFullProcess: async (req, res) => {
        try {
            const { startDate, endDate } = req.body;
            const response = await RunFullProcessUseCase.execute(startDate, endDate);
            res.status(200).json(response);
        } catch (error) {
            res.status(400).json({
                error: error?.message || 'Error ejecutando full process',
            });
        }
    },

    getSalesCalculationLogs: async (req, res) => {
        try {
            const { source, targetDate, shop, limit } = req.query;
            const filters = {};
            if (source) filters.source = source;
            if (targetDate) filters.targetDate = targetDate;
            if (shop) filters.shop = shop;
            const logs = await salesCalculationLogRepository.find(filters, Number(limit) || 100);
            res.json(logs);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};

module.exports = statisticsController;
