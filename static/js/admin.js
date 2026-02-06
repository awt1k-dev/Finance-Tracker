// JavaScript для админ-панели

document.addEventListener('DOMContentLoaded', function() {
    // 1. Анимация строк таблицы
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.05}s`;
        
        // Эффект при наведении на строку
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 2. Кастомный селект для роли в форме редактирования
    const roleSelects = document.querySelectorAll('.custom-select');
    
    roleSelects.forEach(selectWrapper => {
        const customSelectTrigger = selectWrapper.querySelector('.custom-select__trigger');
        const customSelectText = selectWrapper.querySelector('.custom-select__trigger span');
        const customOptionsContainer = selectWrapper.querySelector('.custom-options');
        const hiddenSelect = selectWrapper.querySelector('select');
        const arrow = selectWrapper.querySelector('.arrow');
        
        if (hiddenSelect && customSelectTrigger && customSelectText && customOptionsContainer) {
            // Заполняем опции из скрытого select
            const options = Array.from(hiddenSelect.options);
            
            // Очищаем контейнер опций
            customOptionsContainer.innerHTML = '';
            
            // Создаем кастомные опции
            options.forEach(option => {
                if (option.value) {
                    const customOption = document.createElement('div');
                    customOption.className = 'custom-option';
                    customOption.dataset.value = option.value;
                    customOption.textContent = option.textContent;
                    
                    // Если опция выбрана в скрытом select
                    if (option.selected) {
                        customOption.classList.add('selected');
                        customSelectText.textContent = option.textContent;
                    }
                    
                    customOption.addEventListener('click', function() {
                        const value = this.dataset.value;
                        const text = this.textContent;
                        
                        // Обновляем скрытый select
                        hiddenSelect.value = value;
                        
                        // Обновляем отображаемый текст
                        customSelectText.textContent = text;
                        
                        // Закрываем выпадающий список
                        selectWrapper.classList.remove('open');
                        if (arrow) arrow.style.transform = 'rotate(0)';
                        
                        // Обновляем выделение
                        customOptionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        this.classList.add('selected');
                        
                        // Анимация выбора
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    customOptionsContainer.appendChild(customOption);
                }
            });
            
            // Открытие/закрытие выпадающего списка
            customSelectTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = selectWrapper.classList.contains('open');
                
                // Закрываем все открытые селекты
                document.querySelectorAll('.custom-select.open').forEach(select => {
                    select.classList.remove('open');
                    const selectArrow = select.querySelector('.arrow');
                    if (selectArrow) selectArrow.style.transform = 'rotate(0)';
                });
                
                // Открываем/закрываем текущий
                if (!isOpen) {
                    selectWrapper.classList.add('open');
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            });
            
            // Закрытие при клике вне селекта
            document.addEventListener('click', function(e) {
                if (!selectWrapper.contains(e.target)) {
                    selectWrapper.classList.remove('open');
                    if (arrow) arrow.style.transform = 'rotate(0)';
                }
            });
            
            // Закрытие при нажатии Esc
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && selectWrapper.classList.contains('open')) {
                    selectWrapper.classList.remove('open');
                    if (arrow) arrow.style.transform = 'rotate(0)';
                }
            });
        }
    });
    
    // 3. Подтверждение удаления пользователя
    const deleteButtons = document.querySelectorAll('.btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const row = this.closest('tr');
            const username = row.querySelector('td:nth-child(2)').textContent;
            
            if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?\nЭто действие нельзя отменить.`)) {
                e.preventDefault();
                return false;
            }
            
            // Анимация удаления строки
            row.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            
            // Позволяем форме отправиться после анимации
            setTimeout(() => {
                // Если это форма, отправляем ее
                const form = this.closest('form');
                if (form) {
                    form.submit();
                }
            }, 400);
        });
    });
    
    // 4. Плавное появление уведомлений
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach((toast, index) => {
        toast.style.animationDelay = `${index * 0.2}s`;
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 5000);
    });
    
    // 5. Подсветка ролей в таблице
    tableRows.forEach(row => {
        const roleCell = row.querySelector('td:nth-child(6)');
        if (roleCell) {
            const role = roleCell.textContent.trim().toLowerCase();
            switch(role) {
                case 'admin':
                    roleCell.style.color = '#ff6b6b';
                    roleCell.style.fontWeight = '600';
                    break;
                case 'moderator':
                    roleCell.style.color = '#4cff9a';
                    roleCell.style.fontWeight = '600';
                    break;
                default:
                    roleCell.style.color = '#aaa';
            }
        }
    });
    
    // 6. Эффект параллакса для фона
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.body.style.backgroundPosition = 
            `${x * 10}% ${y * 10}%`;
    });
    
    // 7. Анимация отправки формы редактирования
    const editForm = document.querySelector('.edit-form');
    if (editForm) {
        const submitBtn = editForm.querySelector('.submit-btn');
        if (submitBtn) {
            editForm.addEventListener('submit', function(e) {
                // Анимация кнопки
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Сохраняем оригинальный текст
                const originalText = submitBtn.textContent;
                submitBtn.setAttribute('data-original-text', originalText);
                submitBtn.textContent = '';
                
                // Через 3 секунды снимаем загрузку (на случай, если что-то пошло не так)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 3000);
            });
        }
    }
    
    // 8. Улучшенная обработка клавиатуры для форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('keydown', function(e) {
            // Enter для отправки формы
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    e.preventDefault();
                    submitBtn.click();
                }
            }
            
            // Escape для отмены
            if (e.key === 'Escape') {
                const cancelBtn = this.querySelector('button[type="button"], .cancel-btn');
                if (cancelBtn) {
                    e.preventDefault();
                    cancelBtn.click();
                }
            }
        });
    });
    
    // 9. Анимация для карточек статистики (если есть)
    const statCards = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    statCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // 10. Обработка формы удаления пользователя (GET запрос)
    const deleteForms = document.querySelectorAll('form[action*="delete"]');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const form = this;
            const row = this.closest('tr');
            
            // Анимация удаления строки
            if (row) {
                row.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            }
            
            // Отправляем запрос после анимации
            setTimeout(() => {
                // Отправляем GET запрос на URL из action формы
                const url = form.getAttribute('action');
                if (url) {
                    window.location.href = url;
                }
            }, 400);
        });
    });
});