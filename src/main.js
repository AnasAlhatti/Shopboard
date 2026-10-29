import './style.css';

// Form submit event for user feedback while preserving native HTML5 validation
const registerForm = document.querySelector('.register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const successMsg = document.querySelector('.form-success');
    if (successMsg) {
      successMsg.hidden = false;
      registerForm.reset();
    }
  });
}
