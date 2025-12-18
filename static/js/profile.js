// Анимации и AJAX для профиля awtik-cash
document.addEventListener('DOMContentLoaded', function() {
    // ================= ГЛОБАЛЬНЫЕ ФУНКЦИИ =================
    
    // Функция показа уведомлений
    window.showToast = function(message, type = 'info', duration = 5000) {
        const notifications = document.querySelector('.notifications');
        if (!notifications) {
            const notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications';
            document.body.appendChild(notificationsContainer);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.animation = 'toast-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
        
        const container = document.querySelector('.notifications');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, duration);
        
        toast.addEventListener('click', function() {
            this.style.animation = 'toast-out 0.5s ease forwards';
            setTimeout(() => {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }, 500);
        });
        
        return toast;
    };

    // Функция обновления баланса на странице
    window.updateBalance = function(balance) {
        const balanceElement = document.getElementById('user-balance');
        if (!balanceElement) return;
        
        balanceElement.textContent = balance;
        
        if (balance < 0) {
            balanceElement.className = 'value-low';
            balanceElement.style.animation = 'pulse 1s';
            setTimeout(() => {
                balanceElement.style.animation = '';
            }, 1000);
        } else {
            balanceElement.className = 'value';
        }
    };

    // Функция обновления счетчика транзакций
    window.updateTransactionCount = function(count) {
        const countElement = document.getElementById('transactions-count');
        if (countElement) {
            countElement.textContent = count;
        }
    };

    // Функция форматирования даты
    window.formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Функция анимации счетчика
    function animateCounter(element, finalValue, duration = 1500) {
        if (isNaN(finalValue)) return;
        
        let currentValue = 0;
        const increment = Math.ceil(Math.abs(finalValue) / 50);
        const stepTime = Math.abs(Math.floor(duration / (finalValue / increment)));
        
        const timer = setInterval(() => {
            if (finalValue >= 0) {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
            } else {
                currentValue -= increment;
                if (currentValue <= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
            }
            element.textContent = currentValue;
        }, stepTime);
    }

    // ================= 1. АНИМАЦИЯ СТРОК ТАБЛИЦЫ =================
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ================= 2. КАСТОМНЫЙ СЕЛЕКТ ДЛЯ КАТЕГОРИЙ =================
    const typeButtons = document.querySelectorAll('.type-btn');
    const typeInput = document.getElementById('tx-type');
    const customCategory = document.getElementById('custom-category');
    
    const categorySelectWrapper = document.querySelector('.custom-select');
    const customSelectTrigger = categorySelectWrapper?.querySelector('.custom-select__trigger span');
    const customOptionsContainer = document.querySelector('.custom-options');
    const hiddenSelect = document.getElementById('category-select');
    
    const incomeCategories = ['Зарплата', 'Инвестиции', 'Подарок', 'Возврат долга', 'Другое'];
    const expenseCategories = ['Еда', 'Транспорт', 'Жилье', 'Развлечения', 'Здоровье', 'Образование', 'Другое'];
    
    if (categorySelectWrapper && customSelectTrigger) {
        function updateCategories(type) {
            const categories = type === 'income' ? incomeCategories : expenseCategories;
            const currentValue = hiddenSelect.value;
            
            customOptionsContainer.innerHTML = '';
            hiddenSelect.innerHTML = '';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                hiddenSelect.appendChild(option);
                
                const customOption = document.createElement('div');
                customOption.className = 'custom-option';
                customOption.dataset.value = category;
                customOption.textContent = category;
                
                customOption.addEventListener('click', function() {
                    const value = this.dataset.value;
                    
                    hiddenSelect.value = value;
                    customSelectTrigger.textContent = value;
                    
                    categorySelectWrapper.classList.remove('open');
                    
                    customOptionsContainer.querySelectorAll('.custom-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    toggleCustomCategory();
                    
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                customOptionsContainer.appendChild(customOption);
            });
            
            if (!currentValue || !categories.includes(currentValue)) {
                hiddenSelect.value = categories[0];
                customSelectTrigger.textContent = categories[0];
                const firstOption = customOptionsContainer.querySelector('.custom-option');
                if (firstOption) firstOption.classList.add('selected');
            } else {
                hiddenSelect.value = currentValue;
                customSelectTrigger.textContent = currentValue;
                const selectedOption = customOptionsContainer.querySelector(`[data-value="${currentValue}"]`);
                if (selectedOption) selectedOption.classList.add('selected');
            }
            
            toggleCustomCategory();
        }
        
        function toggleCustomCategory() {
            if (!customCategory) return;
            
            if (hiddenSelect.value === 'Другое') {
                // Если элемент скрыт, показываем его, затем добавляем класс для анимации
                if (customCategory.style.display === 'none') {
                    customCategory.style.display = 'block';
                    // Сброс анимации: сначала убираем класс visible, чтобы элемент был в начальном состоянии
                    customCategory.classList.remove('visible');
                    // Даем браузеру время на отрисовку, затем добавляем класс для анимации
                    setTimeout(() => {
                        customCategory.classList.add('visible');
                        customCategory.focus();
                    }, 10);
                } else {
                    // Если элемент уже видим, просто добавляем класс (на всякий случай)
                    customCategory.classList.add('visible');
                }
            } else {
                // Убираем класс visible для анимации скрытия
                customCategory.classList.remove('visible');
                // Через время, достаточное для анимации, скрываем элемент
                setTimeout(() => {
                    // Проверяем, что класс visible не вернули
                    if (!customCategory.classList.contains('visible')) {
                        customCategory.style.display = 'none';
                    }
                }, 300);
            }
        }
        
        typeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const type = this.dataset.type;
                
                typeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                typeInput.value = type;
                updateCategories(type);
                
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
        
        customSelectTrigger.parentElement.addEventListener('click', function(e) {
            e.stopPropagation();
            categorySelectWrapper.classList.toggle('open');
            
            const arrow = this.querySelector('.arrow');
            arrow.style.transform = categorySelectWrapper.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
        });
        
        document.addEventListener('click', function(e) {
            if (!categorySelectWrapper.contains(e.target)) {
                categorySelectWrapper.classList.remove('open');
                const arrow = categorySelectWrapper.querySelector('.arrow');
                if (arrow) arrow.style.transform = 'rotate(0)';
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                categorySelectWrapper.classList.remove('open');
                const arrow = categorySelectWrapper.querySelector('.arrow');
                if (arrow) arrow.style.transform = 'rotate(0)';
            }
        });
        
        updateCategories(typeInput.value);
    }

    // ================= 3. AJAX-УДАЛЕНИЕ ТРАНЗАКЦИИ =================
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            e.preventDefault();
            const deleteBtn = e.target.closest('.delete-btn');
            const form = deleteBtn.closest('form');
            const row = deleteBtn.closest('tr');
            
            if (!form || !row) return;
            
            const txId = form.action.split('/').pop();
            
            // Анимация удаления
            row.style.animation = 'slideOutLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            
            // Отключаем кнопку
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '⌛';
            
            // AJAX запрос
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setTimeout(() => {
                        row.remove();
                        
                        if (data.balance !== undefined) {
                            const balanceElement = document.getElementById('user-balance');
                            if (balanceElement) {
                                const currentBalance = parseInt(balanceElement.textContent);
                                animateCounter(balanceElement, data.balance, 1000);
                                if (data.balance < 0) {
                                    balanceElement.className = 'value-low';
                                } else {
                                    balanceElement.className = 'value';
                                }
                            }
                        }
                        
                        if (data.transactions_count !== undefined) {
                            const countElement = document.getElementById('transactions-count');
                            if (countElement) {
                                animateCounter(countElement, data.transactions_count, 800);
                            }
                        }
                        
                        showToast(data.message || 'Транзакция удалена', 'success');
                        
                        // Если транзакций не осталось
                        const tbody = document.querySelector('tbody');
                        if (tbody && tbody.children.length === 0) {
                            const transactionsSection = document.querySelector('.transactions');
                            const emptyMsg = document.createElement('p');
                            emptyMsg.className = 'empty';
                            emptyMsg.innerHTML = 'No transactions yet <b>:(</b>';
                            emptyMsg.style.animation = 'fadeInUp 0.6s ease';
                            transactionsSection.appendChild(emptyMsg);
                        }
                    }, 400);
                } else {
                    row.style.animation = '';
                    deleteBtn.disabled = false;
                    deleteBtn.innerHTML = '✕';
                    showToast(data.message || 'Ошибка при удалении', 'error');
                }
            })
            .catch(error => {
                console.error('Ошибка при удалении транзакции:', error);
                row.style.animation = '';
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '✕';
                showToast('Ошибка сети', 'error');
            });
        }
    });

    // ================= 4. AJAX-ДОБАВЛЕНИЕ ТРАНЗАКЦИИ =================
    const transactionForm = document.querySelector('.transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Валидация суммы
            const amountInput = this.querySelector('input[name="amount"]');
            const amount = parseFloat(amountInput.value);
            if (!amount || amount <= 0) {
                showToast('Введите корректную сумму', 'error');
                amountInput.focus();
                amountInput.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    amountInput.style.animation = '';
                }, 500);
                return;
            }
            
            // Эффект загрузки
            submitBtn.innerHTML = 'Добавление...';
            submitBtn.style.pointerEvents = 'none';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.transform = 'scale(0.95)';
            
            // Собираем данные
            const formData = new FormData(this);
            
            if (hiddenSelect && hiddenSelect.value === 'Другое' && customCategory) {
                const customCategoryValue = customCategory.value.trim();
                if (customCategoryValue) {
                    formData.set('custom_category', customCategoryValue);
                }
            }
            
            // AJAX запрос
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Обновляем баланс с анимацией
                    if (data.balance !== undefined) {
                        const balanceElement = document.getElementById('user-balance');
                        if (balanceElement) {
                            animateCounter(balanceElement, data.balance, 1000);
                            if (data.balance < 0) {
                                balanceElement.className = 'value-low';
                            } else {
                                balanceElement.className = 'value';
                            }
                        }
                    }
                    
                    // Обновляем счетчик с анимацией
                    if (data.transactions_count !== undefined) {
                        const countElement = document.getElementById('transactions-count');
                        if (countElement) {
                            animateCounter(countElement, data.transactions_count, 800);
                        }
                    }
                    
                    // Добавляем транзакцию в таблицу
                    if (data.transaction) {
                        addTransactionToTable(data.transaction);
                    }
                    
                    // Сбрасываем форму
                    this.reset();
                    
                    // Восстанавливаем значения по умолчанию
                    typeInput.value = 'income';
                    typeButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.type === 'income') {
                            btn.classList.add('active');
                        }
                    });
                    
                    if (categorySelectWrapper && customSelectTrigger) {
                        updateCategories('income');
                    }
                    
                    // Уведомление
                    showToast(data.message || 'Транзакция добавлена', 'success', 3000);
                    
                    // Анимация успеха
                    submitBtn.style.background = 'rgba(76, 255, 154, 0.1)';
                    submitBtn.style.borderColor = 'rgba(76, 255, 154, 0.3)';
                } else {
                    showToast(data.message || 'Ошибка при добавлении', 'error');
                }
            })
            .catch(error => {
                console.error('Ошибка при добавлении транзакции:', error);
                showToast('Ошибка сети', 'error');
            })
            .finally(() => {
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.pointerEvents = '';
                    submitBtn.style.opacity = '1';
                    submitBtn.style.transform = 'scale(1)';
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';
                }, 1000);
            });
        });
    }

    // Функция добавления транзакции в таблицу
    function addTransactionToTable(transaction) {
        const tbody = document.querySelector('tbody');
        const emptyMessage = document.querySelector('.empty');
        
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        const newRow = document.createElement('tr');
        newRow.className = transaction.type === 'income' ? 'income' : 'expense';
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(-20px)';
        
        const formattedDate = formatDate(transaction.created_at);
        
        newRow.innerHTML = `
            <td>${transaction.type}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.category}</td>
            <td>${transaction.note || '-'}</td>
            <td>${formattedDate}</td>
            <td class="delete-cell">
                <form action="/transaction/delete/${transaction.tx_id}" method="post">
                    <button class="delete-btn" type="submit">✕</button>
                </form>
            </td>
        `;
        
        setTimeout(() => {
            newRow.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
        }, 10);
        
        newRow.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        newRow.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        if (tbody.firstChild) {
            tbody.insertBefore(newRow, tbody.firstChild);
        } else {
            tbody.appendChild(newRow);
        }
        
        // Подсветка новой строки
        setTimeout(() => {
            newRow.style.background = 'rgba(76, 255, 154, 0.05)';
            newRow.style.borderLeft = '3px solid rgba(76, 255, 154, 0.5)';
            
            setTimeout(() => {
                newRow.style.background = '';
                newRow.style.borderLeft = '';
            }, 2000);
        }, 500);
    }

    // ================= 5. АНИМАЦИЯ УВЕДОМЛЕНИЙ =================
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach((toast, index) => {
        toast.style.animationDelay = `${index * 0.2}s`;
        
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.5s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 5000);
    });

    // ================= 6. АНИМАЦИЯ СТАТИСТИКИ =================
    const statsCards = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                //entry.target.classList.add('animated');
                
                // Анимация счетов
                const valueElement = entry.target.querySelector('.value, .value-low');
                if (valueElement) {
                    const finalValue = parseInt(valueElement.textContent);
                    if (!isNaN(finalValue)) {
                        animateCounter(valueElement, finalValue, 2000);
                    }
                }
            }
        });
    }, { threshold: 0.1 });
    
    statsCards.forEach(card => observer.observe(card));

    // ================= 7. ЭФФЕКТ ПАРАЛЛАКСА =================
    let mouseX = 0, mouseY = 0;
    let parallaxEnabled = true;
    
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        parallaxEnabled = false;
    }
    
    if (parallaxEnabled) {
        document.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            
            document.body.style.backgroundPosition = 
                `calc(50% + ${mouseX}px) calc(50% + ${mouseY}px)`;
        });
    }

    // ================= 8. АНИМАЦИЯ ПОЛЯ СУММЫ =================
    const amountInput = document.querySelector('input[name="amount"]');
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            
            if (value > 0) {
                this.style.borderColor = 'rgba(76, 255, 154, 0.3)';
                this.style.boxShadow = '0 0 0 2px rgba(76, 255, 154, 0.1)';
                
                this.style.animation = 'pulse 1s';
                setTimeout(() => {
                    this.style.animation = '';
                }, 1000);
            } else if (value < 0) {
                this.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                this.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                
                this.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            } else {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.style.boxShadow = 'none';
            }
        });
        
        setTimeout(() => {
            amountInput.focus();
        }, 800);
    }

    // ================= 9. АДАПТИВНЫЙ МАКЕТ =================
    function updateLayout() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
    }
    
    window.addEventListener('resize', updateLayout);
    updateLayout();

    // ================= 10. ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ =================
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px) scale(0.98)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
    });

    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .stat-card.animated {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .mobile .stat-card:hover {
            transform: none !important;
        }
    `;
    document.head.appendChild(style);

    console.log('Профиль инициализирован успешно!');
}); 