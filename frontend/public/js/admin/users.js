// frontend/public/js/admin/users.js
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