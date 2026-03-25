const Category = require("../../../domain/models/Category");
const CategoryRepository = require("../../../infrastructure/persistence/repositories/CategoryRepository");

class CreateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(name) {
    const category = new Category(null, name);
    return this.categoryRepository.create(category);
  }
}

module.exports = new CreateCategoryUseCase(new CategoryRepository());
