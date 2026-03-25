const CategoryRepository = require("../../../infrastructure/persistence/repositories/CategoryRepository");

class UpdateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(categoryId, data) {
    return this.categoryRepository.update(categoryId, data);
  }
}

module.exports = new UpdateCategoryUseCase(new CategoryRepository());
