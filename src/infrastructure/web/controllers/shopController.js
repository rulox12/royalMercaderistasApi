const CreateShopUseCase = require("../../../application/useCases/shop/createShop");
const GetShopUseCase = require("../../../application/useCases/shop/getShop");
const GetShopsUseCase = require("../../../application/useCases/shop/getShops");
const UpdateShopUseCase = require("../../../application/useCases/shop/updateShop");
const DeleteShopUseCase = require("../../../application/useCases/shop/deleteShop");

const shopController = {
  createShop: async (req, res) => {
    try {
      const { shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId } = req.body;
      console.log({
        shopNumber,
        name,
        address,
        manager,
        phone,
        boss,
        bossPhone,
        platformId,
        cityId,
        listId,
        userId
      });
      const createdShop = await CreateShopUseCase.execute({
        shopNumber,
        name,
        address,
        manager,
        phone,
        boss,
        bossPhone,
        platformId,
        cityId,
        listId,
        userId
      });

      res.status(201).json(createdShop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getShop: async (req, res) => {
    try {
      const shopId = req.params.shopId;
      const shop = await GetShopUseCase.execute(shopId);

      if (!shop) {
        return res.status(404).json({ message: "Tienda no encontrada" });
      }
      res.status(200).json(shop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateShop: async (req, res) => {
    try {
      const shopId = req.params.shopId;
      const shopData = req.body;

      const updatedShop = await UpdateShopUseCase.execute(shopId, shopData);

      if (!updatedShop) {
        return res.status(404).json({ message: "Tienda no encontrada" });
      }

      res.status(200).json(updatedShop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getShops: async (req, res) => {
    try {
      const shops = await GetShopsUseCase.execute();

      if (!shops) {
        return res.status(404).json({ message: "Tiendas no encontradas" });
      }

      res.status(200).json(shops);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteShop: async (req, res) => {
    try {
      const shopDeleted = await DeleteShopUseCase.execute(req.body.shopId);

      res.status(200).json(shopDeleted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = shopController;
