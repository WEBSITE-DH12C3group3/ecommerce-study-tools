let currentPage = 1;
const limit = 10;

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
    console.log('Gọi API:', `/api/admin/products?page=${page}&limit=${limit}&search=${search}&category_id=${category}&brand_id=${brand}&priceSort=${sort}`);
    const response = await fetch(`/api/admin/products?page=${page}&limit=${limit}&search=${search}&category_id=${category}&brand_id=${brand}&priceSort=${sort}`, {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Accept': 'application/json',
    },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Lỗi ${response.status}: ${errorData.message || 'Không thể lấy sản phẩm'}`);
    }
    const data = await response.json();
    console.log('Dữ liệu API:', data);
    renderProducts(data.products);
    updatePagination(data.totalPages, page);
  } catch (error) {
    showNotification(`Lỗi khi tải sản phẩm: ${error.message}`, true);
    console.error('Lỗi:', error);
    document.getElementById('productTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">Không thể tải sản phẩm</td></tr>';
  }
}

// Hàm hiển thị sản phẩm
function renderProducts(products) {
  const tbody = document.getElementById('productTableBody');
  if (!products || products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">Không có sản phẩm</td></tr>';
    return;
  }
  tbody.innerHTML = products
    .map(product => `
      <tr class="border-t">
        <td class="px-4 py-3">${product.product_id}</td>
        <td class="px-4 py-3">
        <img src="${product.image_url ? `/upload/${product.image_url}` : 'https://via.placeholder.com/50'}" alt="${product.product_name}" 
        class="w-12 h-12 object-cover rounded">

        </td>
        <td class="px-4 py-3">${escapeHTML(product.product_name)}</td>
        <td class="px-4 py-3">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</td>
        <td class="px-4 py-3">${product.stock_quantity}</td>
        <td class="px-4 py-3">${product.Category ? escapeHTML(product.Category.category_name) : ''}</td>
        <td class="px-4 py-3">${product.Brand ? escapeHTML(product.Brand.brand_name) : ''}</td>
        <td class="px-4 py-3 flex gap-2">
          <button onclick="editProduct(${product.product_id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
            <i class="fas fa-edit"></i> Sửa
          </button>
          <button onclick="deleteProduct(${product.product_id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `)
    .join('');
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

// Hàm sửa sản phẩm
async function editProduct(id) {
  try {
    const response = await fetch(`/api/admin/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Lỗi khi lấy sản phẩm');
    const product = await response.json();
    document.getElementById('productId').value = product.product_id;
    document.getElementById('productName').value = product.product_name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('stockQuantity').value = product.stock_quantity;
    document.getElementById('categoryId').value = product.category_id;
    document.getElementById('brandId').value = product.brand_id;
    document.getElementById('description').value = product.description || '';
    document.getElementById('modalTitle').textContent = 'Sửa sản phẩm';
    document.getElementById('productModal').classList.remove('hidden');
  } catch (error) {
    showNotification('Lỗi khi tải sản phẩm', true);
    console.error('Lỗi:', error);
  }
}

// Hàm xóa sản phẩm
async function deleteProduct(id) {
  if (confirm('Xác nhận xóa sản phẩm này?')) {
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
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
    const formData = new FormData();
    formData.append('product_name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock_quantity', document.getElementById('stockQuantity').value);
    formData.append('category_id', document.getElementById('categoryId').value);
    formData.append('brand_id', document.getElementById('brandId').value);
    formData.append('description', document.getElementById('description').value);
    if (document.getElementById('productImage').files[0]) {
      formData.append('image', document.getElementById('productImage').files[0]);
    }

    const id = document.getElementById('productId').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';

    try {
      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // Nếu dùng JWT
        },
      });
      if (!response.ok) throw new Error('Lỗi khi lưu sản phẩm');
      showNotification(id ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
      document.getElementById('productModal').classList.add('hidden');
      loadProducts(currentPage);
    } catch (error) {
      showNotification('Lỗi khi lưu sản phẩm', true);
      console.error('Lỗi:', error);
    }
  });

  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
});