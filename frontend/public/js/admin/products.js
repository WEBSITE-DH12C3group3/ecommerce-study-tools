let currentPage = 1;
const limit = 10;
let showDeleted = false; // trạng thái: đang xem sản phẩm đã xóa hay chưa

// Hàm hiển thị thông báo
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  notificationMessage.textContent = message;
  notification.classList.remove('hidden', 'opacity-0', isError ? 'bg-green-500' : 'bg-red-500');
  notification.classList.add(isError ? 'bg-red-500' : 'bg-green-500', 'opacity-100');
  setTimeout(() => {
    notification.classList.remove('opacity-100');
    notification.classList.add('opacity-0');
    setTimeout(() => notification.classList.add('hidden'), 300);
  }, 2000);
}

// Hàm lấy danh sách sản phẩm
async function loadProducts(page = 1) {
  const search = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const brand = document.getElementById('brandFilter').value;
  const sort = document.getElementById('sortFilter').value;

  try {
    let url = `/api/admin/products?page=${page}&limit=${limit}&search=${search}&category_id=${category}&brand_id=${brand}&priceSort=${sort}`;
    if (showDeleted) url += "&status=deleted";

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error("Không thể lấy sản phẩm");
    const data = await response.json();

    renderProducts(data.products);
    updatePagination(data.totalPages, page);
  } catch (error) {
    showNotification(`Lỗi khi tải sản phẩm: ${error.message}`, true);
  }
}

// Hàm hiển thị sản phẩm
function renderProducts(products) {
  const tbody = document.getElementById("productTableBody");
  tbody.innerHTML = "";

  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">Không có sản phẩm</td></tr>';
    return;
  }

  products.forEach(p => {
    let actions = "";
    if (showDeleted) {
      actions = `
        <button class="restoreBtn bg-green-600 text-white py-1 px-3 rounded" data-id="${p.product_id}">
          <i class="fas fa-undo"></i> Khôi phục
        </button>
        <button class="hardDeleteBtn bg-red-600 text-white py-1 px-3 rounded" data-id="${p.product_id}">
          <i class="fas fa-trash-alt"></i> Xóa hẳn
        </button>
      `;
    } else {
      actions = `
        <button onclick="window.location.href='/admin/products/edit/${p.product_id}'"
          class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
          <i class="fas fa-edit"></i> Sửa
        </button>
        <button onclick="deleteProduct(${p.product_id})"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          <i class="fas fa-trash"></i> Xóa
        </button>
      `;
    }

    tbody.innerHTML += `
      <tr>
        <td>${p.product_id}</td>
        <td><img src="/uploads/${p.image_url}" class="w-16 h-16 object-cover rounded"/></td>
        <td>${p.product_name}</td>
        <td>${p.price}</td>
        <td>${p.stock_quantity}</td>
        <td>${p.Category?.category_name || ''}</td>
        <td>${p.Brand?.brand_name || ''}</td>
        <td>${actions}</td>
      </tr>
    `;
  });

  // Gắn sự kiện
  document.querySelectorAll(".restoreBtn").forEach(btn => {
    btn.addEventListener("click", () => restoreProduct(btn.dataset.id));
  });
  document.querySelectorAll(".hardDeleteBtn").forEach(btn => {
    btn.addEventListener("click", () => hardDeleteProduct(btn.dataset.id));
  });
}

// Hàm cập nhật phân trang
function updatePagination(totalPages, page) {
  document.getElementById('pageInfo').textContent = `Trang ${page}`;
  document.getElementById('prevPage').disabled = page === 1;
  document.getElementById('nextPage').disabled = page >= totalPages;
  currentPage = page;
}

// Hàm load danh mục
async function loadCategories() {
  try {
    const response = await fetch('/api/admin/categories');
    const categories = await response.json();
    const select = document.getElementById('categoryFilter');
    const modalSelect = document.getElementById('categoryId');
    select.innerHTML = '<option value="">Lọc theo danh mục</option>' + categories.map(cat => `<option value="${cat.category_id}">${escapeHTML(cat.category_name)}</option>`).join('');
    modalSelect.innerHTML = categories.map(cat => `<option value="${cat.category_id}">${escapeHTML(cat.category_name)}</option>`).join('');
  } catch (error) {
    console.error('Lỗi khi tải danh mục:', error);
  }
}

// Hàm load thương hiệu
async function loadBrands() {
  try {
    const response = await fetch('/api/admin/brands');
    const brands = await response.json();
    const select = document.getElementById('brandFilter');
    const modalSelect = document.getElementById('brandId');
    select.innerHTML = '<option value="">Lọc theo thương hiệu</option>' + brands.map(brand => `<option value="${brand.brand_id}">${escapeHTML(brand.brand_name)}</option>`).join('');
    modalSelect.innerHTML = brands.map(brand => `<option value="${brand.brand_id}">${escapeHTML(brand.brand_name)}</option>`).join('');
  } catch (error) {
    console.error('Lỗi khi tải thương hiệu:', error);
  }
}


// Hàm xóa sản phẩm
async function deleteProduct(id) {
  if (confirm('Xác nhận xóa sản phẩm này?')) {
    try {
      const response = await fetch(`/api/admin/products/${id}`, { 
        method: 'DELETE',
        credentials: 'include'   // Gửi cookie session kèm request
      });
      if (!response.ok) throw new Error('Lỗi khi xóa sản phẩm');
      showNotification('Xóa sản phẩm thành công');
      loadProducts(currentPage);
    } catch (error) {
      showNotification('Lỗi khi xóa sản phẩm', true);
      console.error('Lỗi:', error);
    }
  }
}


// Hàm xuất CSV
async function exportToCsv() {
  try {
    const response = await fetch(`/api/admin/products?limit=1000`);
    if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu');
    const { products } = await response.json();
    const csv = [
      'ID,Tên sản phẩm,Giá,Tồn kho,Danh mục,Thương hiệu',
      ...products.map(p => [
        p.product_id,
        `"${p.product_name.replace(/"/g, '""')}"`,
        p.price,
        p.stock_quantity,
        p.Category ? `"${p.Category.category_name.replace(/"/g, '""')}"` : '',
        p.Brand ? `"${p.Brand.brand_name.replace(/"/g, '""')}"` : '',
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showNotification('Lỗi khi xuất CSV', true);
    console.error('Lỗi:', error);
  }
}

// Hàm escape HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Hàm debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Sự kiện khi trang tải
document.addEventListener('DOMContentLoaded', () => {
  loadProducts(currentPage);
  loadCategories();
  loadBrands();

  // Tìm kiếm, lọc, sắp xếp
  document.getElementById('searchInput').addEventListener('input', debounce(() => loadProducts(1), 300));
  document.getElementById('categoryFilter').addEventListener('change', () => loadProducts(1));
  document.getElementById('brandFilter').addEventListener('change', () => loadProducts(1));
  document.getElementById('sortFilter').addEventListener('change', () => loadProducts(1));

  // Phân trang
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadProducts(currentPage);
    }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadProducts(currentPage);
  });

  // Thêm sản phẩm
  document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm';
    document.getElementById('productModal').classList.remove('hidden');
  });

  // Đóng modal
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('productModal').classList.add('hidden');
  });

  // Submit form
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
  const method = id ? 'PUT' : 'POST';

  const formData = new FormData(document.getElementById('productForm'));

  try {
    const response = await fetch(url, { method, body: formData });
    if (!response.ok) throw new Error('Lỗi khi lưu sản phẩm');
    showNotification('Lưu sản phẩm thành công');
    document.getElementById('productModal').classList.add('hidden');
    loadProducts(currentPage);
  } catch (err) {
    showNotification(err.message, true);
  }
});


  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
});

document.getElementById("showDeletedBtn").addEventListener("click", () => {
  showDeleted = !showDeleted; // đảo trạng thái
  loadProducts(1);

  // đổi text nút để dễ hiểu
  const btn = document.getElementById("showDeletedBtn");
  if (showDeleted) {
    btn.textContent = "Quay lại danh sách";
    btn.classList.add("bg-gray-600");
  } else {
    btn.textContent = "Sản phẩm đã xóa";
    btn.classList.remove("bg-gray-600");
  }
});



// function renderTable(products, deleted = false) {
//   const tbody = document.getElementById("productTableBody");
//   tbody.innerHTML = "";

//   products.forEach(p => {
//     let actions = "";
//     if (deleted) {
//       actions = `
//         <button class="restoreBtn bg-green-600 text-white py-1 px-3 rounded" data-id="${p.product_id}">
//           <i class="fas fa-undo"></i> Khôi phục
//         </button>
//         <button class="hardDeleteBtn bg-red-600 text-white py-1 px-3 rounded" data-id="${p.product_id}">
//           <i class="fas fa-trash-alt"></i> Xóa hẳn
//         </button>
//       `;
//     } else {
//       actions = `
//         <button class="editBtn bg-yellow-500 text-white py-1 px-3 rounded" data-id="${p.product_id}">
//           <i class="fas fa-edit"></i> Sửa
//         </button>
//         <button class="deleteBtn bg-red-600 text-white py-1 px-3 rounded" data-id="${p.product_id}">
//           <i class="fas fa-trash"></i> Xóa
//         </button>
//       `;
//     }

//     tbody.innerHTML += `
//       <tr>
//         <td>${p.product_id}</td>
//         <td><img src="/uploads/${p.image_url}" class="w-16 h-16 object-cover rounded"/></td>
//         <td>${p.product_name}</td>
//         <td>${p.price}</td>
//         <td>${p.stock_quantity}</td>
//         <td>${p.Category?.category_name || ''}</td>
//         <td>${p.Brand?.brand_name || ''}</td>
//         <td>${actions}</td>
//       </tr>
//     `;
//   });

//   // attach sự kiện restore / hard delete
//   document.querySelectorAll(".restoreBtn").forEach(btn => {
//     btn.addEventListener("click", () => restoreProduct(btn.dataset.id));
//   });
//   document.querySelectorAll(".hardDeleteBtn").forEach(btn => {
//     btn.addEventListener("click", () => hardDeleteProduct(btn.dataset.id));
//   });
// }

function restoreProduct(id) {
  fetch(`/api/admin/products/${id}/restore`, { method: "PUT" })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadProducts(1, true);
    });
}

function hardDeleteProduct(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?")) return;

  fetch(`/api/admin/products/${id}/hard`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        showDeleted = true;
        loadProducts(1, true);
      }
    });
}