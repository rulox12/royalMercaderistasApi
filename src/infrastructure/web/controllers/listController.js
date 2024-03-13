const CreateListUseCase = require('../../../application/useCases/list/createList');
const CreateListProductUseCase = require('../../../application/useCases/list/createListProduct');
const GetListProductUseCase = require('../../../application/useCases/list/getListProduct');
const GetListUseCase = require('../../../application/useCases/list/getList');
const GetListsUseCase = require('../../../application/useCases/list/getLists');

const listController = {
  createList: async (req, res) => {
    try {
      const { name } = req.body;

      const createdList = await CreateListUseCase.execute(name);

      res.status(201).json(createdList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getList: async (req, res) => {
    try {
      const listId = req.params.listId;
      const list = await GetListUseCase.execute(listId);

      if (!list) {
        return res.status(404).json({ message: "Lista no encontrada" });
      }

      res.status(200).json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLists: async (req, res) => {
    try {
      const lists = await GetListsUseCase.execute();

      if (!lists) {
        return res.status(404).json({ message: "No se encontraron listas" });
      }

      res.status(200).json(lists);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createListProducts: async (req, res) => {
    try {
      const { listId, products } = req.body;
      const savedProducts = await CreateListProductUseCase.execute(listId, products);

      return res.status(200).json({ message: 'Productos de la lista guardados correctamente', savedProducts });
    } catch (error) {
      console.error('Error al guardar productos de la lista:', error);
      return res.status(500).json({ message: 'Error al guardar productos de la lista' });
    }
  },

  getListProducts: async (req, res) => {
    try {
      const listId = req.params.listId;
      const populateProduct = req.params.populateProduct == 'true';
      const listProducts = await GetListProductUseCase.execute(listId, populateProduct);
      return res.status(200).json(listProducts);
    } catch (error) {
      console.error('Error al obtener lista de productos:', error);
      return res.status(500).json({ message: 'Error al obtener lista' });
    }
  }


};

module.exports = listController;
