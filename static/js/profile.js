document.querySelectorAll('.toast').forEach(toast => {
    // Через 4 секунды запускаем анимацию
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.4s forwards';
        // После завершения анимации полностью удаляем элемент
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
});
