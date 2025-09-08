// frontend/public/js/admin/users.js
let currentPage = 1;
const limit = 10;


function showNotification(message, isError = false) {
    const el = document.getElementById('notification');
    el.textContent = message;
    el.classList.remove('hidden', 'opacity-0', isError ? 'bg-green-500' : 'bg-red-500');
    el.classList.add(isError ? 'bg-red-500' : 'bg-green-500', 'opacity-100');
    setTimeout(() => {
        el.classList.remove('opacity-100');
        el.classList.add('opacity-0');
        setTimeout(() => el.classList.add('hidden'), 300);
    }, 2000);
}


async function loadRoles() {
    try {
        const res = await fetch('/api/admin/roles', { headers: { 'Accept': 'application/json' } });
        const roles = await res.json();
        const filter = document.getElementById('roleFilter');
        const select = document.getElementById('roleId');
        filter.innerHTML = '<option value="">Lọc theo vai trò</option>' + roles.map(r => `<option value="${r.role_id}">${escapeHTML(r.role_name)}</option>`).join('');
        select.innerHTML = roles.map(r => `<option value="${r.role_id}">${escapeHTML(r.role_name)}</option>`).join('');
    } catch (e) { console.error('Lỗi loadRoles:', e); }
}


async function loadUsers(page = 1) {
    const search = document.getElementById('searchInput').value || '';
    const role = document.getElementById('roleFilter').value || '';
    const sort = document.getElementById('sortFilter').value || 'newest';


    try {
        const url = `/api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role_id=${role}&sort=${sort}`;
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                'Accept': 'application/json',
            }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderUsers(data.users);
        updatePagination(data.totalPages, page);
    } catch (err) {
        console.error('Lỗi loadUsers:', err);
        document.getElementById('userTableBody').innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">Không thể tải người dùng</td></tr>';
        showNotification('Lỗi khi tải người dùng', true);
    }
}


function renderUsers(users) {
    const tbody = document.getElementById('userTableBody');
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">Không có người dùng</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(u => `
    <tr class="border-t">
<td class="px-4 py-3">${u.user_id}</td>
<td class="px-4 py-3">${escapeHTML(u.full_name)}</td>
<td class="px-4 py-3">${escapeHTML(u.email)}</td>
<td class="px-4 py-3">${escapeHTML(u.phone || '')}</td>
<td class="px-4 py-3">${u.Role ? escapeHTML(u.Role.role_name) : ''}</td>
<td class="px-4 py-3">${new Date(u.created_at).toLocaleString('vi-VN')}</td>
<td class="px-4 py-3 flex gap-2">
<button onclick="editUser(${u.user_id})" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Sửa</button>
<button onclick="deleteUser(${u.user_id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Xoá</button>
</td>
</tr>
`).join('');
}

function updatePagination(totalPages, page) {
    document.getElementById('pageInfo').textContent = `Trang ${page}`;
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
    currentPage = page;
}


async function editUser(id) {
    try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error('Không lấy được người dùng');
        const u = await res.json();
        document.getElementById('userId').value = u.user_id;
        document.getElementById('fullName').value = u.full_name || '';
        document.getElementById('email').value = u.email || '';
        document.getElementById('phone').value = u.phone || '';
        document.getElementById('address').value = u.address || '';
        document.getElementById('roleId').value = u.role_id || '';
        document.getElementById('password').value = '';
        document.getElementById('modalTitle').textContent = 'Sửa người dùng';
        document.getElementById('userModal').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        showNotification('Lỗi khi tải người dùng', true);
    }
}


async function deleteUser(id) {
    if (!confirm('Xác nhận xoá người dùng này?')) return;
    try {
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Xoá thất bại');
        showNotification('Đã xoá người dùng');
        loadUsers(currentPage);
    } catch (e) {
        console.error(e); showNotification('Lỗi khi xoá người dùng', true);
    }
}
async function exportToCsv() {
    try {
        const res = await fetch(`/api/admin/users?limit=1000`);
        if (!res.ok) throw new Error('Không lấy được dữ liệu');
        const { users } = await res.json();
        const csv = [
            'ID,Họ tên,Email,SĐT,Vai trò,Ngày tạo',
            ...users.map(u => [
                u.user_id,
                `"${(u.full_name || '').replace(/"/g, '""')}"`,
                `"${(u.email || '').replace(/"/g, '""')}"`,
                `"${(u.phone || '').replace(/"/g, '""')}"`,
                `"${(u.Role ? u.Role.role_name : '')}"`,
                new Date(u.created_at).toLocaleString('vi-VN')
            ].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'users.csv'; a.click();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        console.error(e); showNotification('Lỗi khi xuất CSV', true);
    }
}
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}
function debounce(fn, wait) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}


// Boot
document.addEventListener('DOMContentLoaded', () => {
    loadRoles();
    loadUsers(currentPage);


    document.getElementById('searchInput').addEventListener('input', debounce(() => loadUsers(1), 300));
    document.getElementById('roleFilter').addEventListener('change', () => loadUsers(1));
    document.getElementById('sortFilter').addEventListener('change', () => loadUsers(1));


    document.getElementById('prevPage').addEventListener('click', () => { if (currentPage > 1) loadUsers(currentPage - 1); });
    document.getElementById('nextPage').addEventListener('click', () => { loadUsers(currentPage + 1); });


    document.getElementById('addUserBtn').addEventListener('click', () => {
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        document.getElementById('modalTitle').textContent = 'Thêm người dùng';
        document.getElementById('userModal').classList.remove('hidden');
    });


    document.getElementById('closeModal').addEventListener('click', () => document.getElementById('userModal').classList.add('hidden'));
    document.getElementById('cancelBtn').addEventListener('click', () => document.getElementById('userModal').classList.add('hidden'));


    document.getElementById('userForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/users/${id}` : '/api/admin/users';
        const body = {
            full_name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            role_id: document.getElementById('roleId').value,
            password: document.getElementById('password').value // để trống khi không đổi
        };
        if (!body.password) delete body.password;


        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || data?.error || 'Lỗi khi lưu người dùng');
            showNotification(id ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
            document.getElementById('userModal').classList.add('hidden');
            loadUsers(currentPage);
        } catch (e) {
            console.error(e); showNotification(e.message, true);
        }
    });


    document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);
});