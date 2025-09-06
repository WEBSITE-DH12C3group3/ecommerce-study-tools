// public/js/admin/categories.js
const API_URL = "/api/admin/categories"; // Sử dụng URL tương đối

const categoryForm = document.getElementById("categoryForm");
const categoryTable = document.querySelector("#categoryTable tbody");
const editForm = document.getElementById("editForm");
let editModal;

// Khi trang load thì lấy danh sách
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  editModal = new bootstrap.Modal(document.getElementById("editModal"));
});

// Lấy danh sách category
async function loadCategories() {
  try {
    const res = await axios.get(API_URL);
    renderCategories(res.data);
  } catch (err) {
    handleError(err, "Lỗi tải danh mục");
  }
}

// Render bảng
function renderCategories(categories) {
  categoryTable.innerHTML = "";
  categories.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHTML(cat.category_id)}</td>
      <td>${escapeHTML(cat.category_name)}</td>
      <td>${escapeHTML(cat.description || "")}</td>
      <td class="text-center">
        <button class="btn btn-warning btn-sm" onclick="openEdit(${cat.category_id}, '${escapeHTML(cat.category_name)}', '${escapeHTML(cat.description || "")}')">Sửa</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.category_id})">Xóa</button>
      </td>
    `;
    categoryTable.appendChild(row);
  });
}

// Thêm category
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category_name = document.getElementById("category_name").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!category_name) {
    alert("Tên danh mục không được để trống!");
    return;
  }

  try {
    await axios.post(API_URL, { category_name, description });
    alert("Thêm danh mục thành công!");
    categoryForm.reset();
    loadCategories();
  } catch (err) {
    handleError(err, "Lỗi thêm danh mục");
  }
});

// Mở modal sửa
function openEdit(id, name, desc) {
  document.getElementById("edit_id").value = id;
  document.getElementById("edit_name").value = name;
  document.getElementById("edit_description").value = desc;
  editModal.show();
}

// Lưu sửa category
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit_id").value;
  const category_name = document.getElementById("edit_name").value.trim();
  const description = document.getElementById("edit_description").value.trim();

  if (!category_name) {
    alert("Tên danh mục không được để trống!");
    return;
  }

  try {
    await axios.put(`${API_URL}/${id}`, { category_name, description });
    alert("Cập nhật danh mục thành công!");
    editModal.hide();
    loadCategories();
  } catch (err) {
    handleError(err, "Lỗi sửa danh mục");
  }
});

// Xóa category
async function deleteCategory(id) {
  if (confirm("Bạn có chắc muốn xóa danh mục này không?")) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Xóa danh mục thành công!");
      loadCategories();
    } catch (err) {
      handleError(err, "Lỗi xóa danh mục");
    }
  }
}

// Hàm xử lý lỗi
function handleError(err, defaultMessage) {
  console.error(defaultMessage + ":", err);
  if (err.response) {
    if (err.response.status === 401) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này!");
      window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập
    } else if (err.response.status === 403) {
      alert("Bạn không có quyền admin để thực hiện thao tác này!");
    } else {
      alert(defaultMessage + ": " + (err.response.data.message || "Lỗi không xác định"));
    }
  } else {
    alert(defaultMessage + ": Lỗi kết nối server");
  }
}

// Hàm bảo vệ XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}