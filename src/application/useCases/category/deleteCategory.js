const CategoryRepository = require("../../../infrastructure/persistence/repositories/CategoryRepository");

class DeleteCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(categoryId) {
    return this.categoryRepository.delete(categoryId);
  }
}

module.exports = new DeleteCategoryUseCase(new CategoryRepository());
