const moment = require("moment");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ValidateOrderInventoryUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, orderDate, products) {
        const currentDate = moment.utc(orderDate, "YYYY-MM-DD", true);
        if (!currentDate.isValid()) {
            throw new RangeError("Fecha de orden inválida");
        }

        const productIds = Object.keys(products);
        const previousDetails = await this.orderRepository.getLatestOrderDetailsByShopBeforeDate(
            shopId,
            currentDate.startOf("day").toDate(),
            productIds,
        );
        const previousDetailsByProduct = new Map(
            previousDetails.map((detail) => [detail._id.toString(), detail]),
        );
        const errors = [];

        for (const [productId, product] of Object.entries(products)) {
            const enteredInventory = toNumber(product.INVE);
            const enteredDamage = toNumber(product.AVER);

            // Reglas del mismo día: averías sin inventario, o averías mayores al inventario.
            if (enteredDamage !== null) {
                if (enteredInventory === null) {
                    errors.push({
                        productId,
                        field: "AVER",
                        rule: "missingInventory",
                        enteredValue: enteredDamage,
                        maximum: null,
                        comparedDate: orderDate,
                    });
                } else if (enteredDamage > enteredInventory) {
                    errors.push({
                        productId,
                        field: "AVER",
                        rule: "sameDayInventory",
                        enteredValue: enteredDamage,
                        maximum: enteredInventory,
                        comparedDate: orderDate,
                    });
                }
            }

            const previousDetail = previousDetailsByProduct.get(productId);
            if (!previousDetail || !hasValue(previousDetail.INVE)) {
                continue;
            }

            const previousFinal = calculateFinalInventory(previousDetail);
            for (const field of ["INVE", "AVER"]) {
                const enteredValue = toNumber(product[field]);
                if (enteredValue !== null && enteredValue > previousFinal) {
                    errors.push({
                        productId,
                        field,
                        rule: "previousFinal",
                        enteredValue,
                        maximum: previousFinal,
                        comparedDate: moment.utc(previousDetail.date).format("YYYY-MM-DD"),
                    });
                }
            }
        }

        return errors;
    }
}

function calculateFinalInventory(detail) {
    const initialInventory = toNumber(detail.INVE) ?? 0;
    const damage = toNumber(detail.AVER) ?? 0;
    const received = toNumber(detail.RECI) ?? 0;
    const requested = toNumber(detail.PEDI) ?? 0;
    return initialInventory + (received > 0 ? received : requested) - damage;
}

function hasValue(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
}

function toNumber(value) {
    if (!hasValue(value)) {
        return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

module.exports = new ValidateOrderInventoryUseCase(new OrderRepository());
