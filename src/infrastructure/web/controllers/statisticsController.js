const StatisticsHome = require('../../../application/useCases/statistics/statisticsHome');

const statisticsController = {
    getHome: async (req, res) => {
        try {
            const response =  await StatisticsHome.execute();
            res.json(response)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = statisticsController;
