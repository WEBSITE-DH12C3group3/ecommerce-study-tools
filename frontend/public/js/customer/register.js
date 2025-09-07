document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Reset thông báo lỗi
  document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');

  // Lấy giá trị từ form
  const fullName = document.getElementById('full_name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;

  // Validation client-side
  let isValid = true;
  if (fullName.length < 3) {
    document.getElementById('full_name_error').style.display = 'block';
    isValid = false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById('email_error').style.display = 'block';
    isValid = false;
  }
  if (phone && !/^\d{10,11}$/.test(phone)) {
    document.getElementById('phone_error').style.display = 'block';
    isValid = false;
  }
  if (address && address.length < 5) {
    document.getElementById('address_error').style.display = 'block';
    isValid = false;
  }
  if (password.length < 6) {
    document.getElementById('password_error').style.display = 'block';
    isValid = false;
  }
  if (confirmPassword !== password) {
    document.getElementById('confirm_password_error').style.display = 'block';
    isValid = false;
  }

  if (!isValid) return;

  // Gửi yêu cầu đăng ký tới API
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name: fullName, email, phone, address, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      window.location.href = '/login';
    } else {
      alert(data.message || 'Đăng ký thất bại, vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
  }
});