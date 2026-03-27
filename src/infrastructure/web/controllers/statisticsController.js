const StatisticsHome = require('../../../application/useCases/statistics/statisticsHome');
const RunFullProcessUseCase = require('../../../application/useCases/statistics/runFullProcess');

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
            res.status(400).json({ error: error.message });
        }
    },
};

module.exports = statisticsController;
