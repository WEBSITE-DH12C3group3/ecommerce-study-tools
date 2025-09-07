document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Reset thông báo lỗi
  document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');

  // Lấy giá trị từ form
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validation client-side
  let isValid = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('email_error').style.display = 'block';
    isValid = false;
  }
  if (password.length < 6) {
    document.getElementById('password_error').style.display = 'block';
    isValid = false;
  }

  if (!isValid) return;

  // Gửi yêu cầu đăng nhập tới API
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Đăng nhập thành công!');
      // Chuyển hướng dựa trên role
      if (data.user.role_id !== 2) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } else {
      alert(data.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
  }
});