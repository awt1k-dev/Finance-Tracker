// JavaScript для страницы входа

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
    
    // 4. Валидация формы в реальном времени
    const loginForm = document.querySelector('.login-form');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (loginForm && loginInput && passwordInput && submitBtn) {
        // Функция проверки валидности
        function checkFormValidity() {
            const isLoginValid = loginInput.value.trim().length > 0;
            const isPasswordValid = passwordInput.value.trim().length >= 6;
            
            if (isLoginValid && isPasswordValid) {
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
                submitBtn.disabled = false;
            } else {
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.disabled = true;
            }
        }
        
        // Слушатели событий
        loginInput.addEventListener('input', function() {
            checkFormValidity();
            
            // Анимация ввода
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Подсветка email
            if (this.value.includes('@')) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                this.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.1)';
            } else if (this.value.length > 0) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                this.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.05)';
            }
        });
        
        passwordInput.addEventListener('input', function() {
            checkFormValidity();
            
            // Анимация ввода
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Визуальная индикация длины пароля
            const length = this.value.length;
            if (length === 0) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            } else if (length < 6) {
                this.style.borderColor = 'rgba(255, 107, 107, 0.5)';
            } else {
                this.style.borderColor = 'rgba(76, 255, 154, 0.5)';
            }
        });
        
        // Инициализация
        checkFormValidity();
        
        // 5. Анимация отправки формы
        loginForm.addEventListener('submit', function(e) {
            // Проверка перед отправкой
            if (submitBtn.disabled) {
                e.preventDefault();
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
    
    // 6. Эффект фокуса для полей ввода
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
    
    // 7. Анимация для навигационных ссылок
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
    
    // 8. Эффект для чекбокса "Запомнить меня"
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    if (rememberCheckbox) {
        const checkboxLabel = rememberCheckbox.parentElement.querySelector('span');
        
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxLabel.style.color = '#fff';
                checkboxLabel.style.fontWeight = '500';
            } else {
                checkboxLabel.style.color = '#888';
                checkboxLabel.style.fontWeight = 'normal';
            }
            
            // Анимация переключения
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    // 9. Эффект для "Забыли пароль?"
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Анимация клика
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Показать уведомление (заглушка)
            const notification = document.createElement('div');
            notification.className = 'flash-warning';
            notification.textContent = 'Функция восстановления пароля временно недоступна';
            notification.style.animation = 'fadeInUp 0.5s ease';
            
            const container = document.querySelector('.main-container');
            const form = document.querySelector('.login-form');
            container.insertBefore(notification, form);
            
            // Автоматическое скрытие уведомления
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-10px)';
                notification.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        });
    }
    
    // 10. Эффект при наведении на брендинг
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
});