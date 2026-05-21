const CategoryRepository = require("../../../infrastructure/persistence/repositories/CategoryRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetCategorySalesSummaryUseCase {
  constructor(categoryRepository, orderRepository) {
    this.categoryRepository = categoryRepository;
    this.orderRepository = orderRepository;
  }

  parseDateStart(dateString) {
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Fecha inválida: ${dateString}`);
    }
    parsedDate.setUTCHours(0, 0, 0, 0);
    return parsedDate;
  }

  parseDateEnd(dateString) {
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Fecha inválida: ${dateString}`);
    }
    parsedDate.setUTCHours(23, 59, 59, 999);
    return parsedDate;
  }

  toIntSafe(value) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  toFloatSafe(value) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  async execute(startDate, endDate, categoryId) {
    const start = this.parseDateStart(startDate);
    const end = this.parseDateEnd(endDate);

    if (start > end) {
      throw new Error("La fecha inicial no puede ser mayor a la fecha final");
    }

    const [categories, orders] = await Promise.all([
      this.categoryRepository.getAll(),
      this.orderRepository.getOrdersByDateRange(start, end),
    ]);

    const categoriesById = new Map(
      categories.map((category) => [String(category._id), category.name])
    );

    const summaryByCategory = new Map();

    for (const order of orders) {
      for (const detail of order.orderDetails || []) {
        const product = detail.product;
        const detailCategoryId = product?.categoryId ? String(product.categoryId) : null;

        if (!detailCategoryId) {
          continue;
        }

        if (categoryId && detailCategoryId !== categoryId) {
          continue;
        }

        const soldUnits = this.toIntSafe(detail.VENT);
        if (soldUnits === 0) {
          continue;
        }

        const salePrice = this.toFloatSafe(detail.salePrice);
        const saleValue = soldUnits * salePrice;

        if (!summaryByCategory.has(detailCategoryId)) {
          summaryByCategory.set(detailCategoryId, {
            categoryId: detailCategoryId,
            categoryName: categoriesById.get(detailCategoryId) || "Categoría sin nombre",
            unitsSold: 0,
            salesValue: 0,
            products: new Set(),
          });
        }

        const categorySummary = summaryByCategory.get(detailCategoryId);
        categorySummary.unitsSold += soldUnits;
        categorySummary.salesValue += saleValue;

        if (product?._id) {
          categorySummary.products.add(String(product._id));
        }
      }
    }

    const categoriesSummary = Array.from(summaryByCategory.values())
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        unitsSold: item.unitsSold,
        salesValue: item.salesValue,
        productsCount: item.products.size,
      }))
      .sort((a, b) => b.salesValue - a.salesValue);

    return {
      range: {
        startDate,
        endDate,
      },
      totals: {
        unitsSold: categoriesSummary.reduce((acc, item) => acc + item.unitsSold, 0),
        salesValue: categoriesSummary.reduce((acc, item) => acc + item.salesValue, 0),
        categoriesCount: categoriesSummary.length,
      },
      categories: categoriesSummary,
    };
  }
}

module.exports = new GetCategorySalesSummaryUseCase(
  new CategoryRepository(),
  new OrderRepository()
);