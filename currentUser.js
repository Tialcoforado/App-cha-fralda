// currentUser.js - Gerencia o usuário atual em sessionStorage

export const currentUser = {
  STORAGE_KEY: 'cha_current_user_v1',

  /**
   * Obtém o nome do usuário atual
   * @returns {string|null}
   */
  getName() {
    return sessionStorage.getItem(this.STORAGE_KEY) || null;
  },

  /**
   * Define o nome do usuário atual
   * @param {string} name
   */
  setName(name) {
    if (name && name.trim()) {
      sessionStorage.setItem(this.STORAGE_KEY, name.trim());
      return true;
    }
    return false;
  },

  /**
   * Verifica se há usuário registrado
   * @returns {boolean}
   */
  isRegistered() {
    return !!this.getName();
  },

  /**
   * Limpa o usuário atual (logout)
   */
  clear() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Obtém ou pede o nome do usuário
   * Mostra um prompt se não houver usuário registrado
   * @returns {string|null}
   */
  getOrPrompt() {
    let name = this.getName();
    
    if (!name) {
      name = prompt('Qual é seu nome?');
      if (name) {
        this.setName(name);
      }
    }
    
    return this.getName();
  }
};
