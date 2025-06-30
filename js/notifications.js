// notifications.js
// Notification system

class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.init();
    }

    init() {
        if (!this.container) {
            console.warn('Notification container not found');
        }
    }

    show(message, type = 'info', duration = 4000) {
        if (!this.container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-title">${this.getTitle(type)}</div>
            <div class="notification-message">${this.escapeHtml(message)}</div>
        `;

        this.container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);

        return notification;
    }

    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default NotificationSystem;
