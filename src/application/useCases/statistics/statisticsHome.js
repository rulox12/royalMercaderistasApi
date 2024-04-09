const StatisticsRepository = require("../../../infrastructure/persistence/repositories/StatisticsRepository");

class StatisticsHome {
  constructor(statisticsRepository) {
    this.statisticsRepository = statisticsRepository;
  }

  async execute() {
    const totalSales = await this.statisticsRepository.totalSales();
    const totalBreakdowns = await this.statisticsRepository.totalBreakdowns();
    const totalOrders = await this.statisticsRepository.totalBreakdowns();
    const totalBigOrders = await this.statisticsRepository.totalBigOrders();

    return {
      totalSales,
      totalBreakdowns,
      totalOrders,
      totalBigOrders
    }

  }
}

module.exports = new StatisticsHome(new StatisticsRepository());
