let currentPage = 1;
const limit = 10;

// Hiển thị thông báo
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

// Lấy danh sách categories
async function loadCategories(page = 1) {
  const search = document.getElementById('searchInput').value;
  try {
    console.log('Gọi API:', `/api/admin/categories?page=${page}&limit=${limit}&search=${search}`);
    const response = await fetch(`/api/admin/categories?page=${page}&limit=${limit}&search=${search}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Không thể lấy danh mục');

    const data = await response.json();
    console.log('Dữ liệu API:', data);
    renderCategories(data.categories);
    updatePagination(data.totalPages, page);
  } catch (error) {
    showNotification(`Lỗi khi tải danh mục: ${error.message}`, true);
    console.error('Lỗi:', error);
    document.getElementById('categoryTableBody').innerHTML =
      '<tr><td colspan="4" class="text-center text-gray-500 py-4">Không thể tải danh mục</td></tr>';
  }
}

// Render danh mục
function renderCategories(categories) {
  const tbody = document.getElementById('categoryTableBody');
  if (!categories || categories.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-gray-500 py-4">Không có danh mục</td></tr>';
    return;
  }
  tbody.innerHTML = categories
    .map(
      (cat) => `
      <tr class="border-t">
        <td class="px-4 py-3">${cat.category_id}</td>
        <td class="px-4 py-3">${escapeHTML(cat.category_name)}</td>
        <td class="px-4 py-3">${escapeHTML(cat.description || '')}</td>
        <td class="px-4 py-3 flex gap-2">
          <button onclick="editCategory(${cat.category_id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
            <i class="fas fa-edit"></i> Sửa
          </button>
          <button onclick="deleteCategory(${cat.category_id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            <i class="fas fa-trash"></i> Xóa
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

// Phân trang
function updatePagination(totalPages, page) {
  document.getElementById('pageInfo').textContent = `Trang ${page}`;
  document.getElementById('prevPage').disabled = page === 1;
  document.getElementById('nextPage').disabled = page >= totalPages;
  currentPage = page;
}

// Sửa danh mục
async function editCategory(id) {
  try {
    const response = await fetch(`/api/admin/categories/${id}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Lỗi khi lấy danh mục');
    const cat = await response.json();
    document.getElementById('categoryId').value = cat.category_id;
    document.getElementById('categoryName').value = cat.category_name;
    document.getElementById('description').value = cat.description || '';
    document.getElementById('modalTitle').textContent = 'Sửa danh mục';
    document.getElementById('categoryModal').classList.remove('hidden');
  } catch (error) {
    showNotification('Lỗi khi tải danh mục', true);
    console.error(error);
  }
}

// Xóa danh mục
async function deleteCategory(id) {
  if (confirm('Xác nhận xóa danh mục này?')) {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Lỗi khi xóa danh mục');
      showNotification('Xóa danh mục thành công');
      loadCategories(currentPage);
    } catch (error) {
      showNotification('Lỗi khi xóa danh mục', true);
      console.error(error);
    }
  }
}

// Escape HTML
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Khi trang load
document.addEventListener('DOMContentLoaded', () => {
  loadCategories(currentPage);

  // Tìm kiếm
  document.getElementById('searchInput').addEventListener('input', debounce(() => loadCategories(1), 300));

  // Phân trang
  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadCategories(currentPage);
    }
  });
  document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadCategories(currentPage);
  });

  // Thêm danh mục
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('modalTitle').textContent = 'Thêm danh mục';
    document.getElementById('categoryModal').classList.remove('hidden');
  });

  // Đóng modal
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('categoryModal').classList.add('hidden');
  });

  // Submit form
  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('categoryId').value;
    const data = {
      category_name: document.getElementById('categoryName').value,
      description: document.getElementById('description').value,
    };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/categories/${id}` : '/api/admin/categories';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Lỗi khi lưu danh mục');
      showNotification(id ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
      document.getElementById('categoryModal').classList.add('hidden');
      loadCategories(currentPage);
    } catch (error) {
      showNotification('Lỗi khi lưu danh mục', true);
      console.error(error);
    }
  });
});
