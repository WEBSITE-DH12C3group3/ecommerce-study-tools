document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

async function fetchCategories() {
  try {
    console.log("Đang gọi API /api/customer/categories");
    const response = await fetch("/api/customer/categories");
    if (!response.ok) throw new Error("Lỗi khi lấy danh sách danh mục");

    const data = await response.json();
    console.log("Dữ liệu danh mục:", data);

    // ✅ lấy đúng mảng categories
    const categories = data && Array.isArray(data.categories) ? data.categories : [];

    renderCategories(categories);
    renderHeaderCategories(categories);
    renderMobileCategories(categories);

  } catch (error) {
    console.error("Lỗi:", error);
    renderCategories([]);
    renderHeaderCategories([]);
    renderMobileCategories([]);
  }
}

function renderCategories(categories) {
  const categoryContainer = document.querySelector("#category-list");
  if (!categoryContainer) {
    console.error("Không tìm thấy #category-list");
    return;
  }

  if (!categories || categories.length === 0) {
    categoryContainer.innerHTML =
      '<p class="text-center text-gray-500">Không có danh mục nào!</p>';
    return;
  }

  categoryContainer.innerHTML = categories
    .map(
      (category) => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">${escapeHTML(
            category.category_name
          )}</h3>
          <p class="text-gray-600 mb-4">${escapeHTML(
            category.description || "Không có mô tả"
          )}</p>
          <a href="/products?category_id=${
            category.category_id
          }" class="inline-block bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 transition-colors">
            Xem sản phẩm
          </a>
        </div>
      `
    )
    .join("");
}

function renderHeaderCategories(categories) {
  const headerCategoryContainer = document.querySelector("#header-category-list");
  if (!headerCategoryContainer) {
    console.error("Không tìm thấy #header-category-list");
    return;
  }

  if (!categories || categories.length === 0) {
    headerCategoryContainer.innerHTML =
      '<li class="px-4 py-2 text-center text-gray-500">Không có danh mục nào!</li>';
    return;
  }

  headerCategoryContainer.innerHTML = categories
    .map(
      (category) => `
        <li>
          <a href="/products?category_id=${
            category.category_id
          }&category_name=${encodeURIComponent(
        category.category_name
      )}" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-blue-600">
            ${escapeHTML(category.category_name)}
          </a>
        </li>
      `
    )
    .join("");
}

function renderMobileCategories(categories) {
  const mobileCategoryContainer = document.querySelector("#mobile-category-list");
  if (!mobileCategoryContainer) {
    console.error("Không tìm thấy #mobile-category-list");
    return;
  }

  if (!categories || categories.length === 0) {
    mobileCategoryContainer.innerHTML =
      '<p class="text-center text-gray-500">Không có danh mục nào!</p>';
    return;
  }

  mobileCategoryContainer.innerHTML = categories
    .map(
      (category) => `
        <a href="/products?category_id=${category.category_id}" class="block px-4 py-2 hover:bg-gray-100 text-gray-600">
          ${escapeHTML(category.category_name)}
        </a>
      `
    )
    .join("");
}

function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
