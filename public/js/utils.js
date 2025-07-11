class Utils {
  // API helper
  static async api(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Local storage helpers
  static getCart() {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  }

  static setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartBadge();
  }

  static addToCart(product) {
    const cart = this.getCart();
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    this.setCart(cart);
    this.showNotification('Product added to cart!', 'success');
  }

  static removeFromCart(productId) {
    const cart = this.getCart().filter(item => item._id !== productId);
    this.setCart(cart);
  }

  static updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(item => item._id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.setCart(cart);
      }
    }
  }

  static clearCart() {
    localStorage.removeItem('cart');
    this.updateCartBadge();
  }

  static updateCartBadge() {
    const cart = this.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge');
    
    if (badge) {
      if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Format currency
  static formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Format date
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Show notification
  static showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Loading state
  static showLoading(element) {
    element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  }

  // Set active navigation
  static setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentPath || 
          (currentPath === '/' && link.getAttribute('href') === '/')) {
        link.classList.add('active');
      }
    });
  }

  // Form validation
  static validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = '#dc2626';
        isValid = false;
      } else {
        input.style.borderColor = '#d1d5db';
      }
    });

    return isValid;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Check authentication
  static async checkAuth() {
    try {
      const response = await this.api('/auth/check');
      return response.isAdmin;
    } catch {
      return false;
    }
  }

  // Redirect if not authenticated
  static async requireAuth() {
    const isAuthenticated = await this.checkAuth();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
}

//Adaugarea css pentru notificari
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

//Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
  Utils.updateCartBadge();
  Utils.setActiveNav();
});