const CategoryRepository = require('../../../infrastructure/persistence/repositories/CategoryRepository');
const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');
const RealSaleRepository = require('../../../infrastructure/persistence/repositories/RealSaleRepository');

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toPct = (realSale, calculatedSale) => {
    if (!calculatedSale) {
        return 0;
    }

    return Number((((realSale - calculatedSale) / calculatedSale) * 100).toFixed(2));
};

class GetRealSaleFormDataUseCase {
    constructor(categoryRepository, orderRepository, realSaleRepository) {
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.realSaleRepository = realSaleRepository;
    }

    async execute({ platformId, cityId, shopId, startDate, endDate }) {
        const scopeStartDate = this.parseDateOnly(startDate);
        const scopeEndDate = this.parseDateOnly(endDate);
        const rangeStartDate = this.parseDateStart(startDate);
        const rangeEndDate = this.parseDateEnd(endDate);

        const [categories, orders, existingRealSale] = await Promise.all([
            this.categoryRepository.getAllWithProducts(),
            this.orderRepository.getOrdersByShopAndDateRange(shopId, rangeStartDate, rangeEndDate),
            this.realSaleRepository.findOneByScope({
                platformId,
                cityId,
                shopId,
                startDate: scopeStartDate,
                endDate: scopeEndDate,
            }),
        ]);

        const salesByProductId = new Map();

        orders.forEach((order) => {
            (order.orderDetails || []).forEach((detail) => {
                const productId = detail?.product?._id?.toString();
                if (!productId) {
                    return;
                }

                const currentValue = salesByProductId.get(productId) || 0;
                salesByProductId.set(productId, currentValue + toNumber(detail.VENT));
            });
        });

        const existingByCategoryId = new Map();
        const existingByProductId = new Map();

        (existingRealSale?.categories || []).forEach((category) => {
            const categoryId = category?.categoryId?.toString();
            if (categoryId) {
                existingByCategoryId.set(categoryId, category);
            }

            (category.products || []).forEach((product) => {
                const productId = product?.productId?.toString();
                if (productId) {
                    existingByProductId.set(productId, product);
                }
            });
        });

        const normalizedCategories = (categories || []).map((category) => {
            const categoryId = category._id.toString();
            const categoryExisting = existingByCategoryId.get(categoryId);

            const products = (category.products || [])
                .map((product) => {
                const productId = product._id.toString();
                const productExisting = existingByProductId.get(productId);
                const realSale = salesByProductId.get(productId) || 0;
                const calculatedSale = toNumber(productExisting?.calculatedSale);
                const unitDifference = realSale - calculatedSale;
                const percentageDifference = toPct(realSale, calculatedSale);

                return {
                    _id: product._id,
                    name: product.name,
                    displayName: product.displayName,
                    position: toNumber(product.position),
                    realSale,
                    calculatedSale,
                    unitDifference,
                    percentageDifference,
                };
                })
                .sort((a, b) => a.position - b.position);

            const totalRealSale = products.reduce((sum, product) => sum + toNumber(product.realSale), 0);
            const totalCalculatedSale = products.reduce((sum, product) => sum + toNumber(product.calculatedSale), 0);
            const totalUnitDifference = totalRealSale - totalCalculatedSale;
            const totalPercentageDifference = toPct(totalRealSale, totalCalculatedSale);

            return {
                _id: category._id,
                name: category.name,
                realSale: toNumber(categoryExisting?.realSale) || totalRealSale,
                calculatedSale: toNumber(categoryExisting?.calculatedSale) || totalCalculatedSale,
                unitDifference: toNumber(categoryExisting?.unitDifference) || totalUnitDifference,
                percentageDifference: toNumber(categoryExisting?.percentageDifference) || totalPercentageDifference,
                products,
            };
        });

        return {
            existingRealSaleId: existingRealSale?._id || null,
            categories: normalizedCategories,
        };
    }

    parseDateOnly(dateString) {
        const parsedDate = new Date(dateString);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(`Fecha inválida: ${dateString}`);
        }

        parsedDate.setUTCHours(0, 0, 0, 0);
        return parsedDate;
    }

    parseDateStart(dateString) {
        const parsedDate = this.parseDateOnly(dateString);
        parsedDate.setUTCHours(0, 0, 0, 0);
        return parsedDate;
    }

    parseDateEnd(dateString) {
        const parsedDate = this.parseDateOnly(dateString);
        parsedDate.setUTCHours(23, 59, 59, 999);
        return parsedDate;
    }
}

module.exports = new GetRealSaleFormDataUseCase(
    new CategoryRepository(),
    new OrderRepository(),
    new RealSaleRepository(),
);