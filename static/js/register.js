// JavaScript для страницы регистрации

document.addEventListener('DOMContentLoaded', function() {
    // 1. Плавное появление элементов
    const container = document.querySelector('.main-container');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // 2. Эффект параллакса для фона
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        document.body.style.backgroundPosition = 
            `${mouseX * 10}% ${mouseY * 10}%`;
    });
    
    // 3. Анимация для flash-сообщений
    const flashMessages = document.querySelectorAll('[class^="flash-"]');
    flashMessages.forEach((message, index) => {
        message.style.animationDelay = `${index * 0.2}s`;
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            message.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                if (message.parentNode) {
                    message.style.display = 'none';
                }
            }, 500);
        }, 5000);
    });
    
    // 4. Элементы формы
    const registerForm = document.querySelector('.register-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('password_confirm');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Индикаторы
    const usernameIndicator = usernameInput.nextElementSibling;
    const emailIndicator = emailInput.nextElementSibling;
    const passwordIndicator = passwordInput.nextElementSibling;
    const confirmPasswordIndicator = confirmPasswordInput.nextElementSibling;
    
    // Индикатор сложности пароля
    const strengthBar = document.querySelector('.password-strength');
    const strengthLabel = document.querySelector('.password-strength-label');
    const matchIndicator = document.querySelector('.password-match');
    
    // Требования к паролю
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    
    // 5. Функции валидации
    function validateUsername(username) {
        const isValid = username.length >= 3;
        updateIndicator(usernameIndicator, isValid, '✓', '✗');
        return isValid;
    }
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        updateIndicator(emailIndicator, isValid, '✓', '✗');
        return isValid;
    }
    
    function validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        
        // Обновляем требования
        updateRequirement(reqLength, hasMinLength);
        updateRequirement(reqUppercase, hasUppercase);
        
        // Проверяем сложность
        let strength = 0;
        if (hasMinLength) strength++;
        if (hasUppercase) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Обновляем индикатор сложности
        updatePasswordStrength(strength, password.length);
        
        // Обновляем индикатор поля
        const isValid = hasMinLength && hasUppercase;
        updateIndicator(passwordIndicator, isValid, '✓', '✗');
        
        return isValid;
    }
    
    function validatePasswordMatch(password, confirmPassword) {
        if (confirmPassword.length === 0) {
            matchIndicator.className = 'password-match';
            matchIndicator.textContent = '';
            updateIndicator(confirmPasswordIndicator, true, '', '');
            return false;
        }
        
        const isValid = password === confirmPassword;
        
        // Обновляем индикатор совпадения
        matchIndicator.className = 'password-match visible';
        if (isValid) {
            matchIndicator.classList.add('matching');
            matchIndicator.textContent = '✓ Пароли совпадают';
        } else {
            matchIndicator.classList.add('not-matching');
            matchIndicator.textContent = '✗ Пароли не совпадают';
        }
        
        // Обновляем индикатор поля
        updateIndicator(confirmPasswordIndicator, isValid, '✓', '✗');
        
        return isValid;
    }
    
    function updateIndicator(indicator, isValid, validSymbol, invalidSymbol) {
        indicator.className = 'validation-indicator';
        if (isValid) {
            indicator.classList.add('valid');
            indicator.textContent = validSymbol;
        } else {
            indicator.classList.add('invalid');
            indicator.textContent = invalidSymbol;
        }
    }
    
    function updateRequirement(requirement, isValid) {
        requirement.className = 'requirement';
        if (isValid) {
            requirement.classList.add('valid');
        } else {
            requirement.classList.add('invalid');
        }
    }
    
    function updatePasswordStrength(strength, length) {
        strengthBar.className = 'password-strength';
        strengthLabel.textContent = '';
        
        if (length === 0) {
            strengthLabel.textContent = 'Введите пароль';
            return;
        }
        
        if (strength <= 1) {
            strengthBar.classList.add('weak');
            strengthLabel.textContent = 'Слабый пароль';
        } else if (strength === 2) {
            strengthBar.classList.add('medium');
            strengthLabel.textContent = 'Средний пароль';
        } else if (strength === 3) {
            strengthBar.classList.add('strong');
            strengthLabel.textContent = 'Сильный пароль';
        } else {
            strengthBar.classList.add('very-strong');
            strengthLabel.textContent = 'Очень сильный пароль';
        }
    }
    
    // 6. Общая проверка формы
    function checkFormValidity() {
        const isUsernameValid = validateUsername(usernameInput.value);
        const isEmailValid = validateEmail(emailInput.value);
        const isPasswordValid = validatePassword(passwordInput.value);
        const isPasswordMatchValid = validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
        
        const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isPasswordMatchValid;
        
        // Обновляем состояние кнопки
        if (isFormValid) {
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.disabled = false;
        } else {
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.disabled = true;
        }
        
        return isFormValid;
    }
    
    // 7. Слушатели событий для полей ввода
    usernameInput.addEventListener('input', function() {
        validateUsername(this.value);
        checkFormValidity();
        
        // Анимация ввода
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    emailInput.addEventListener('input', function() {
        validateEmail(this.value);
        checkFormValidity();
        
        // Анимация ввода
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Подсветка в зависимости от валидности
        if (this.value.includes('@')) {
            this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword(this.value);
        checkFormValidity();
        
        // Анимация ввода
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch(passwordInput.value, this.value);
        checkFormValidity();
        
        // Анимация ввода
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // 8. Анимация отправки формы
    if (registerForm && submitBtn) {
        registerForm.addEventListener('submit', function(e) {
            // Проверка перед отправкой
            if (!checkFormValidity()) {
                e.preventDefault();
                
                // Анимация ошибки
                submitBtn.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    submitBtn.style.animation = '';
                }, 500);
                
                return false;
            }
            
            // Анимация кнопки
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Сохраняем оригинальный текст
            const originalText = submitBtn.textContent;
            submitBtn.setAttribute('data-original-text', originalText);
            submitBtn.textContent = '';
            
            // Добавляем задержку для демонстрации анимации
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 2000);
        });
    }
    
    // 9. Эффект фокуса для полей ввода
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
    
    // 10. Анимация для навигационных ссылок
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Добавляем эффект клика
        link.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        link.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
    });
    
    // 11. Эффект при наведении на брендинг
    const brandHeading = document.querySelector('.brand h1');
    if (brandHeading) {
        brandHeading.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(90deg, #fff 0%, #fff 100%)';
            this.style.animation = 'shimmer 2s infinite linear';
        });
        
        brandHeading.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(90deg, #fff 0%, #aaa 100%)';
            this.style.animation = 'shimmer 3s infinite linear';
        });
    }
    
    // 12. Инициализация формы
    checkFormValidity();
    
    // 13. Дополнительные проверки при фокусе
    inputFields.forEach(input => {
        input.addEventListener('blur', function() {
            checkFormValidity();
        });
    });
});