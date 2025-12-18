// Анимации для профиля

document.addEventListener('DOMContentLoaded', function() {
    // 1. Анимация строк таблицы
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.05}s`;
        row.style.setProperty('--row-index', index);
        
        // Эффект при наведении на строку
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 2. Кастомный селект для категорий
    const typeButtons = document.querySelectorAll('.type-btn');
    const typeInput = document.getElementById('tx-type');
    const customCategory = document.getElementById('custom-category');
    
    // Элементы кастомного селекта
    const categorySelectWrapper = document.querySelector('.custom-select');
    const customSelectTrigger = categorySelectWrapper.querySelector('.custom-select__trigger span');
    const customOptionsContainer = document.querySelector('.custom-options');
    const hiddenSelect = document.getElementById('category-select');
    
    // Категории для доходов и расходов
    const incomeCategories = ['Зарплата', 'Инвестиции', 'Подарок', 'Возврат долга', 'Другое'];
    const expenseCategories = ['Еда', 'Транспорт', 'Жилье', 'Развлечения', 'Здоровье', 'Образование', 'Другое'];
    
    // Функция обновления категорий
    function updateCategories(type) {
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        const currentValue = hiddenSelect.value;
        
        // Очищаем контейнер опций
        customOptionsContainer.innerHTML = '';
        hiddenSelect.innerHTML = '';
        
        // Добавляем опции
        categories.forEach(category => {
            // Добавляем в скрытый select
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            hiddenSelect.appendChild(option);
            
            // Добавляем в кастомный интерфейс
            const customOption = document.createElement('div');
            customOption.className = 'custom-option';
            customOption.dataset.value = category;
            customOption.textContent = category;
            
            // Обработчик выбора
            customOption.addEventListener('click', function() {
                const value = this.dataset.value;
                
                // Обновляем значения
                hiddenSelect.value = value;
                customSelectTrigger.textContent = value;
                
                // Закрываем выпадающий список
                categorySelectWrapper.classList.remove('open');
                
                // Обновляем выделение
                customOptionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Показываем/скрываем кастомную категорию
                toggleCustomCategory();
                
                // Анимация выбора
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            customOptionsContainer.appendChild(customOption);
        });
        
        // Устанавливаем значение по умолчанию
        if (!currentValue || !categories.includes(currentValue)) {
            hiddenSelect.value = categories[0];
            customSelectTrigger.textContent = categories[0];
            customOptionsContainer.querySelector('.custom-option').classList.add('selected');
        } else {
            hiddenSelect.value = currentValue;
            customSelectTrigger.textContent = currentValue;
            const selectedOption = customOptionsContainer.querySelector(`[data-value="${currentValue}"]`);
            if (selectedOption) selectedOption.classList.add('selected');
        }
        
        toggleCustomCategory();
    }
    
    // Функция показа/скрытия кастомной категории
    function toggleCustomCategory() {
        if (hiddenSelect.value === 'Другое') {
            customCategory.style.display = 'block';
            customCategory.classList.add('visible');
            
            // Фокус на поле
            setTimeout(() => {
                customCategory.focus();
                customCategory.style.animation = 'pulse 1s';
            }, 300);
        } else {
            customCategory.classList.remove('visible');
            customCategory.style.opacity = '0';
            customCategory.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                customCategory.style.display = 'none';
            }, 300);
        }
    }
    
    // Обработчики для кнопок типа транзакции
    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            
            // Снимаем активный класс со всех кнопок
            typeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Обновляем скрытое поле
            typeInput.value = type;
            
            // Обновляем категории
            updateCategories(type);
            
            // Анимация переключения
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Открытие/закрытие кастомного селекта
    customSelectTrigger.parentElement.addEventListener('click', function(e) {
        e.stopPropagation();
        categorySelectWrapper.classList.toggle('open');
        
        // Анимация стрелки
        const arrow = this.querySelector('.arrow');
        arrow.style.transform = categorySelectWrapper.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
    });
    
    // Закрытие при клике вне селекта
    document.addEventListener('click', function(e) {
        if (!categorySelectWrapper.contains(e.target)) {
            categorySelectWrapper.classList.remove('open');
            categorySelectWrapper.querySelector('.arrow').style.transform = 'rotate(0)';
        }
    });
    
    // Закрытие при нажатии Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            categorySelectWrapper.classList.remove('open');
            categorySelectWrapper.querySelector('.arrow').style.transform = 'rotate(0)';
        }
    });
    
    // Инициализация категорий
    updateCategories(typeInput.value);
    
    // 3. Анимация удаления транзакции
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const form = this.closest('form');
            const row = this.closest('tr');
            
            if (row) {
                // Анимация удаления
                row.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
                
                // Ждем завершения анимации перед отправкой формы
                setTimeout(() => {
                    form.submit();
                }, 400);
                
                e.preventDefault();
            }
        });
    });
    
    // 4. Анимация отправки формы
    const transactionForm = document.querySelector('.transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Добавляем эффект загрузки
            submitBtn.innerHTML = '<span class="loading-text">Добавление...</span>';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.7';
            
            // Анимация кнопки
            submitBtn.style.transform = 'scale(0.95)';
        });
    }
    
    // 5. Плавное появление уведомлений
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
    
    // 6. Анимация статистики при появлении
    const statsCards = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    statsCards.forEach(card => observer.observe(card));
    
    // 7. Эффект параллакса для фона
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        document.body.style.backgroundPosition = 
            `${mouseX * 10}% ${mouseY * 10}%`;
    });
    
    // 8. Анимация для поля суммы
    const amountInput = document.querySelector('input[name="amount"]');
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const value = parseFloat(this.value);
            if (value > 0) {
                this.style.borderColor = 'rgba(76, 255, 154, 0.3)';
                this.style.boxShadow = '0 0 0 2px rgba(76, 255, 154, 0.1)';
            } else if (value < 0) {
                this.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                this.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.style.boxShadow = 'none';
            }
        });
    }
});