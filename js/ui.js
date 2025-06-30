// ui.js
// UI management utilities

class UIManager {
    constructor() {
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.init();
    }

    init() {
        this.setupModalHandlers();
        this.setupTooltips();
    }

    setupModalHandlers() {
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Close modals with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    setupTooltips() {
        // Add tooltips to elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    showLoading(show = true, text = 'Processing...') {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
            const loadingText = document.getElementById('loadingText');
            if (loadingText) {
                loadingText.textContent = text;
            }
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showTooltip(e) {
        const text = e.target.getAttribute('data-tooltip');
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '9999';
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        
        e.target._tooltip = tooltip;
    }

    hideTooltip(e) {
        if (e.target._tooltip) {
            document.body.removeChild(e.target._tooltip);
            delete e.target._tooltip;
        }
    }

    animateElement(element, animation, duration = 300) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (!element) return;

        element.style.animation = `${animation} ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    fadeIn(element, duration = 300) {
        this.animateElement(element, 'fadeIn', duration);
    }

    fadeOut(element, duration = 300) {
        this.animateElement(element, 'fadeOut', duration);
    }

    slideIn(element, direction = 'right', duration = 300) {
        const animation = direction === 'right' ? 'slideInRight' : 'slideInLeft';
        this.animateElement(element, animation, duration);
    }
}

export default UIManager;
