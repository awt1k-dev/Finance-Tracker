function showToast(message, type = 'success') {
    const container = document.getElementById('notifications');
    const toast = document.createElement('div');
    
    // Классы 'toast' и 'success' уже стилизованы в вашем CSS
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Удаление уведомления через 3 секунды
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function copyToken() {
    const token = document.getElementById('bot-token').innerText;
    navigator.clipboard.writeText(token).then(() => {
        // Вызываем уведомление
        showToast('Token copied to clipboard!');
    }).catch(err => {
        showToast('Failed to copy', 'error');
    });
}