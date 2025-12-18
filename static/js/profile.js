document.querySelectorAll('.toast').forEach(toast => {
    // Через 4 секунды запускаем анимацию
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.4s forwards';
        // После завершения анимации полностью удаляем элемент
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
});

const typeButtons = document.querySelectorAll('.type-btn');
const typeInput = document.getElementById('tx-type');
const categorySelect = document.getElementById('category-select');
const customCategoryInput = document.getElementById('custom-category');

const categories = {
    income: ['Пополнение', 'Зарплата', 'Перевод', 'Подарок', 'Другое'],
    expense: ['Трата', 'Транспорт', 'Еда', 'Продукты', 'Одежда', 'Подписки', 'Другое']
};

// Заполнение категорий
function renderCategories(type) {
    categorySelect.innerHTML = '';

    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    customCategoryInput.style.display = 'none';
    customCategoryInput.value = '';
}

// Инициализация
renderCategories('income');

// Переключение типа
typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        typeInput.value = type;
        renderCategories(type);
    });
});

// Появление поля "Другое"
categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'Другое') {
        customCategoryInput.style.display = 'block';
        customCategoryInput.required = true;
    } else {
        customCategoryInput.style.display = 'none';
        customCategoryInput.required = false;
        customCategoryInput.value = '';
    }
});
