// ui.js - Sistema de feedback visual (Toast, alerts, etc)

export const ui = {
  /**
   * Mostra uma mensagem toast (notificação temporária)
   * @param {string} message - Mensagem a exibir
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Duração em ms (default 3000)
   */
  showToast(message, type = 'info', duration = 3000) {
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Definir ícone e conteúdo
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    
    // Inserir no DOM
    document.body.appendChild(toast);
    
    // Animar entrada
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Remover após duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Mostra mensagem de sucesso
   * @param {string} message
   */
  showSuccess(message) {
    this.showToast(message, 'success', 3000);
  },

  /**
   * Mostra mensagem de erro
   * @param {string} message
   */
  showError(message) {
    this.showToast(message, 'error', 4000);
  },

  /**
   * Mostra mensagem de aviso
   * @param {string} message
   */
  showWarning(message) {
    this.showToast(message, 'warning', 3500);
  },

  /**
   * Mostra mensagem de informação
   * @param {string} message
   */
  showInfo(message) {
    this.showToast(message, 'info', 3000);
  },

  /**
   * Mostra erros de validação em um campo
   * @param {string} fieldId - ID do input
   * @param {string} errorMessage - Mensagem de erro
   */
  showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remover classe de erro anterior
    field.classList.remove('field-error');
    
    // Remover erro anterior se existir
    const existingError = field.parentNode.querySelector('.field-error-message');
    if (existingError) existingError.remove();

    // Adicionar nova classe de erro
    field.classList.add('field-error');
    
    // Criar elemento de mensagem de erro
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error-message';
    errorEl.textContent = errorMessage;
    field.parentNode.appendChild(errorEl);
  },

  /**
   * Limpar erro de um campo
   * @param {string} fieldId
   */
  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('field-error');
    const errorEl = field.parentNode.querySelector('.field-error-message');
    if (errorEl) errorEl.remove();
  },

  /**
   * Mostra uma confirmação modal
   * @param {string} message - Mensagem de confirmação
   * @param {string} title - Título (opcional)
   * @returns {Promise<boolean>}
   */
  async confirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'confirm-modal-overlay';
      modal.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-modal-header">
            <h3>${title}</h3>
          </div>
          <div class="confirm-modal-body">
            <p>${message}</p>
          </div>
          <div class="confirm-modal-footer">
            <button class="btn cancel-btn">Cancelar</button>
            <button class="btn btn-primary confirm-btn">Confirmar</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const confirmBtn = modal.querySelector('.confirm-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');
      
      const cleanup = () => {
        modal.classList.add('hidden');
        setTimeout(() => modal.remove(), 200);
      };
      
      confirmBtn.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      // Tecla Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleEscape);
          cleanup();
          resolve(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Animar entrada
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });
    });
  },

  /**
   * Mostra estado de carregamento
   * @param {boolean} show - true para mostrar, false para esconder
   */
  setLoading(show = true) {
    let loader = document.getElementById('global-loader');
    
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'global-loader';
        loader.innerHTML = `
          <div class="spinner"></div>
          <p>Carregando...</p>
        `;
        document.body.appendChild(loader);
      }
      loader.classList.add('show');
    } else {
      if (loader) {
        loader.classList.remove('show');
      }
    }
  }
};
