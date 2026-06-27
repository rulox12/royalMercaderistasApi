const CreateRealSaleUseCase = require('../../../application/useCases/realSale/createRealSale');
const GetRealSaleFormDataUseCase = require('../../../application/useCases/realSale/getRealSaleFormData');
const UpdateRealSaleUseCase = require('../../../application/useCases/realSale/updateRealSale');

const realSaleController = {
    getFormData: async (req, res) => {
        try {
            const {
                platformId,
                cityId,
                shopId,
                startDate,
                endDate,
            } = req.query;

            if (!platformId || !cityId || !shopId || !startDate || !endDate) {
                return res.status(400).json({
                    error: 'platformId, cityId, shopId, startDate y endDate son obligatorios',
                });
            }

            const data = await GetRealSaleFormDataUseCase.execute({
                platformId,
                cityId,
                shopId,
                startDate,
                endDate,
            });

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    createRealSale: async (req, res) => {
        try {
            const {
                platformId,
                cityId,
                shopId,
                startDate,
                endDate,
                categories,
            } = req.body;

            if (!platformId || !cityId || !shopId || !startDate || !endDate) {
                return res.status(400).json({
                    error: 'platformId, cityId, shopId, startDate y endDate son obligatorios',
                });
            }

            const created = await CreateRealSaleUseCase.execute({
                platformId,
                cityId,
                shopId,
                startDate,
                endDate,
                categories: Array.isArray(categories) ? categories : [],
            });

            return res.status(201).json(created);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    updateRealSale: async (req, res) => {
        try {
            const { realSaleId } = req.params;
            const updated = await UpdateRealSaleUseCase.execute(realSaleId, req.body);

            if (!updated) {
                return res.status(404).json({ message: 'RealSale no encontrada' });
            }

            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};

module.exports = realSaleController;