let currentPage = 1;
const limit = 10;
const API = '/api/admin/suppliers';

function showNotification(message, isError = false) {
  const n = document.getElementById('notification');
  const m = document.getElementById('notification-message');
  m.textContent = message;
  n.classList.remove('hidden');
  setTimeout(() => n.classList.add('hidden'), 2000);
}

function escapeHTML(s = '') {
  const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}

function updatePagination(totalPages, page) {
  document.getElementById('pageInfo').textContent = `Trang ${page}`;
  document.getElementById('prevPage').disabled = page === 1;
  document.getElementById('nextPage').disabled = page >= totalPages;
  currentPage = page;
}

async function loadSuppliers(page = 1) {
  const search = document.getElementById('searchInput')?.value || '';
  try {
    const res = await fetch(`${API}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // nếu API cần token
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderSuppliers(data.suppliers || []); // ✅ đọc đúng key
    updatePagination(data.totalPages || 1, data.currentPage || page);
  } catch (e) {
    console.error(e);
    showNotification('Lỗi khi tải nhà cung cấp', true);
    document.getElementById('supplierTableBody').innerHTML =
      '<tr><td colspan="4" class="text-center">Không thể tải</td></tr>';
  }
}

function renderSuppliers(items = []) {
  const tbody = document.getElementById('supplierTableBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Không có nhà cung cấp</td></tr>';
    return;
  }
  tbody.innerHTML = items.map(s => `
    <tr class="border-t">
      <td class="px-4 py-3">${s.supplier_id}</td>
      <td class="px-4 py-3 font-medium">${escapeHTML(s.supplier_name)}</td>
      <td class="px-4 py-3 whitespace-pre-line">${escapeHTML(s.contact_info || '')}</td>
      <td class="px-4 py-3">
        <button onclick="editSupplier(${s.supplier_id})">Sửa</button>
        <button onclick="deleteSupplier(${s.supplier_id})">Xóa</button>
      </td>
    </tr>
  `).join('');
}

async function editSupplier(id) {
  try {
    const res = await fetch(`${API}/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
    if (!res.ok) throw new Error('Lỗi lấy NCC');
    const s = await res.json();
    document.getElementById('supplierId').value = s.supplier_id;
    document.getElementById('supplierName').value = s.supplier_name || '';
    document.getElementById('contactInfo').value = s.contact_info || '';
    document.getElementById('supplierModal').classList.remove('hidden');
  } catch (e) {
    showNotification('Lỗi khi tải NCC', true);
  }
}

async function deleteSupplier(id) {
  if (!confirm('Xác nhận xóa?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
    if (!res.ok) throw new Error('Lỗi xóa');
    showNotification('Đã xóa');
    loadSuppliers(currentPage);
  } catch (e) {
    showNotification('Lỗi khi xóa', true);
  }
}

async function exportSuppliersCsv() {
  const search = document.getElementById('searchInput')?.value || '';
  const res = await fetch(`${API}/export?search=${encodeURIComponent(search)}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
  });
  if (!res.ok) return showNotification('Lỗi xuất CSV', true);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'suppliers.csv'; a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  loadSuppliers(currentPage);
  document.getElementById('searchInput')?.addEventListener('input', () => loadSuppliers(1));
  document.getElementById('prevPage')?.addEventListener('click', () => currentPage > 1 && loadSuppliers(currentPage - 1));
  document.getElementById('nextPage')?.addEventListener('click', () => loadSuppliers(currentPage + 1));
  document.getElementById('addSupplierBtn')?.addEventListener('click', () => {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('supplierModal').classList.remove('hidden');
  });
  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('supplierModal').classList.add('hidden');
  });
  document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('supplierId').value.trim();
    const payload = {
      supplier_name: document.getElementById('supplierName').value.trim(),
      contact_info:  document.getElementById('contactInfo').value.trim(),
    };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API}/${id}` : API;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return showNotification('Lỗi khi lưu', true);
    showNotification(id ? 'Cập nhật thành công' : 'Thêm thành công');
    document.getElementById('supplierModal').classList.add('hidden');
    loadSuppliers(currentPage);
  });
});

// để gọi từ HTML inline
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
