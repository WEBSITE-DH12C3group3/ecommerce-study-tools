const API_URL = "http://localhost:8080/api/categories"; // endpoint backend

const categoryForm = document.getElementById("categoryForm");
const categoryTable = document.querySelector("#categoryTable tbody");
const editForm = document.getElementById("editForm");
let editModal;

// Khi trang load thì lấy danh sách
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  editModal = new bootstrap.Modal(document.getElementById("editModal"));
});

// ✅ Lấy danh sách category
async function loadCategories() {
  try {
    const res = await axios.get(API_URL);
    renderCategories(res.data);
  } catch (err) {
    console.error("Lỗi tải danh mục:", err);
  }
}

// ✅ Render bảng
function renderCategories(categories) {
  categoryTable.innerHTML = "";
  categories.forEach(cat => {
    const row = `
      <tr>
        <td>${cat.category_id}</td>
        <td>${cat.category_name}</td>
        <td>${cat.description || ""}</td>
        <td class="text-center">
          <button class="btn btn-warning btn-sm" onclick="openEdit(${cat.category_id}, '${cat.category_name}', '${cat.description || ""}')">Sửa</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.category_id})">Xóa</button>
        </td>
      </tr>
    `;
    categoryTable.insertAdjacentHTML("beforeend", row);
  });
}

// ✅ Thêm category
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category_name = document.getElementById("category_name").value;
  const description = document.getElementById("description").value;

  try {
    await axios.post(API_URL, { category_name, description });
    categoryForm.reset();
    loadCategories();
  } catch (err) {
    console.error("Lỗi thêm danh mục:", err);
  }
});

// ✅ Mở modal sửa
function openEdit(id, name, desc) {
  document.getElementById("edit_id").value = id;
  document.getElementById("edit_name").value = name;
  document.getElementById("edit_description").value = desc;
  editModal.show();
}

// ✅ Lưu sửa category
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit_id").value;
  const category_name = document.getElementById("edit_name").value;
  const description = document.getElementById("edit_description").value;

  try {
    await axios.put(`${API_URL}/${id}`, { category_name, description });
    editModal.hide();
    loadCategories();
  } catch (err) {
    console.error("Lỗi sửa danh mục:", err);
  }
});

// ✅ Xóa category
async function deleteCategory(id) {
  if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      loadCategories();
    } catch (err) {
      console.error("Lỗi xóa danh mục:", err);
    }
  }
}
