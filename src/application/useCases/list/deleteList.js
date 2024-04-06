const ListRepository = require('../../../infrastructure/persistence/repositories/ListRepository');
const ProductRepository = require('../../../infrastructure/persistence/repositories/ProductRepository');

class DeleteListUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository;
  }

  async execute(id) {
    try {
      const deleteDetailsList = await this.listRepository.delete(id);
      this.listRepository.deleteDetailsByList(id)

      return deleteDetailsList;
    } catch (e) {
      console.log('capturoelerror', e)
    }
  }
}

module.exports = new DeleteListUseCase(new ListRepository());