const CategoryRepository = require("../../../infrastructure/persistence/repositories/CategoryRepository");

class GetCategoriesUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute() {
    return this.categoryRepository.getAllWithProducts();
  }
}

module.exports = new GetCategoriesUseCase(new CategoryRepository());
