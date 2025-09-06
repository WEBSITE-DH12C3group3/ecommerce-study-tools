// public/js/customer/categories.js
document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

async function fetchCategories() {
  try {
    const response = await fetch("/api/customer/categories");
    if (!response.ok) throw new Error("Lỗi khi lấy danh sách danh mục");
    const categories = await response.json();
    renderCategories(categories);
  } catch (error) {
    console.error("Lỗi:", error);
    renderCategories([]);
  }
}

function renderCategories(categories) {
  const categoryContainer = document.querySelector("#category-list");
  if (!categories || categories.length === 0) {
    categoryContainer.innerHTML = '<p class="text-center text-gray-500">Không có danh mục nào!</p>';
    return;
  }

  categoryContainer.innerHTML = categories
    .map(
      (category) => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">${escapeHTML(category.category_name)}</h3>
          <p class="text-gray-600 mb-4">${escapeHTML(category.description || "Không có mô tả")}</p>
          <a href="/products?category=${category.category_id}" class="inline-block bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 transition-colors">Xem sản phẩm</a>
        </div>
      `
    )
    .join("");
}

// Hàm bảo vệ XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}