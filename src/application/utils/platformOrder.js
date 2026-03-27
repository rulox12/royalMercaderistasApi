const PLATFORM_ORDER = ["bogota", "cartagena", "barranquilla", "santa marta", "bucaramanga"];

const normalizePlatformName = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getPlatformOrderIndex = (platformName) => {
  const index = PLATFORM_ORDER.indexOf(normalizePlatformName(platformName));
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const sortByPlatformName = (items = [], selector = (item) => item?.name) =>
  [...items].sort((leftItem, rightItem) => {
    const leftName = selector(leftItem) || "";
    const rightName = selector(rightItem) || "";

    const leftIndex = getPlatformOrderIndex(leftName);
    const rightIndex = getPlatformOrderIndex(rightName);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return String(leftName).localeCompare(String(rightName), "es", { sensitivity: "base" });
  });

module.exports = {
  sortByPlatformName,
};