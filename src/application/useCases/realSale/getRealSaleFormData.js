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

const buildProductState = ({ product, productExisting, calculatedSale }) => {
    const realSale = toNumber(productExisting?.realSale);
    const unitDifference = realSale - calculatedSale;

    return {
        _id: product._id,
        name: product.name,
        displayName: product.displayName,
        position: toNumber(product.position),
        realSale,
        calculatedSale,
        unitDifference,
        percentageDifference: toPct(realSale, calculatedSale),
    };
};

const distributeProductsByCategorySale = (products, categoryRealSale) => {
    const totalCalculatedSale = products.reduce((sum, product) => sum + toNumber(product.calculatedSale), 0);
    const totalRealSale = Math.max(0, Math.round(toNumber(categoryRealSale)));

    const allocatedByProductId = {};

    if (products.length > 0) {
        if (totalCalculatedSale > 0) {
            const weighted = products.map((product) => {
                const productCalculatedSale = toNumber(product.calculatedSale);
                const raw = (productCalculatedSale / totalCalculatedSale) * totalRealSale;
                const base = Math.floor(raw);

                return {
                    productId: product._id,
                    raw,
                    base,
                    fraction: raw - base,
                };
            });

            const baseSum = weighted.reduce((sum, item) => sum + item.base, 0);
            const remainder = totalRealSale - baseSum;

            weighted.sort((a, b) => b.fraction - a.fraction);

            weighted.forEach((item, index) => {
                allocatedByProductId[item.productId] = item.base + (index < remainder ? 1 : 0);
            });
        } else {
            const base = Math.floor(totalRealSale / products.length);
            let remainder = totalRealSale - (base * products.length);

            products.forEach((product) => {
                const extra = remainder > 0 ? 1 : 0;
                allocatedByProductId[product._id] = base + extra;
                remainder -= extra;
            });
        }
    }

    const distributedProducts = products.map((product) => {
        const productCalculatedSale = toNumber(product.calculatedSale);
        const productRealSale = allocatedByProductId[product._id] || 0;
        const unitDifference = productRealSale - productCalculatedSale;

        return {
            ...product,
            realSale: productRealSale,
            unitDifference,
            percentageDifference: toPct(productRealSale, productCalculatedSale),
        };
    });

    return {
        realSale: totalRealSale,
        unitDifference: totalRealSale - totalCalculatedSale,
        percentageDifference: toPct(totalRealSale, totalCalculatedSale),
        products: distributedProducts,
    };
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
            const groupForSale = category.groupForSale !== false;

            const products = (category.products || [])
                .map((product) => {
                    const productId = product._id.toString();
                    const productExisting = existingByProductId.get(productId);
                    const calculatedSale = salesByProductId.get(productId) || 0;

                    return buildProductState({
                        product,
                        productExisting,
                        calculatedSale,
                    });
                })
                .sort((a, b) => a.position - b.position);

            const totalCalculatedSale = products.reduce((sum, product) => sum + toNumber(product.calculatedSale), 0);

            if (groupForSale) {
                const totalExistingProductRealSale = products.reduce((sum, product) => sum + toNumber(product.realSale), 0);
                const categoryRealSale = toNumber(categoryExisting?.realSale) || totalExistingProductRealSale;
                const groupedTotals = distributeProductsByCategorySale(products, categoryRealSale);

                return {
                    _id: category._id,
                    name: category.name,
                    groupForSale,
                    realSale: groupedTotals.realSale,
                    calculatedSale: totalCalculatedSale,
                    unitDifference: groupedTotals.unitDifference,
                    percentageDifference: groupedTotals.percentageDifference,
                    products: groupedTotals.products,
                };
            }

            const totalRealSale = products.reduce((sum, product) => sum + toNumber(product.realSale), 0);

            return {
                _id: category._id,
                name: category.name,
                groupForSale,
                realSale: totalRealSale,
                calculatedSale: totalCalculatedSale,
                unitDifference: totalRealSale - totalCalculatedSale,
                percentageDifference: toPct(totalRealSale, totalCalculatedSale),
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