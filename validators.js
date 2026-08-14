// validators.js - Sistema de validação centralizado

export const validators = {
  /**
   * Valida nome de convidado
   * @param {string} name
   * @returns {string|null} Mensagem de erro ou null se válido
   */
  guestName(name) {
    if (!name || !name.trim()) {
      return 'Nome é obrigatório';
    }
    if (name.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (name.trim().length > 100) {
      return 'Nome muito longo (máx 100 caracteres)';
    }
    return null;
  },

  /**
   * Valida cidade
   * @param {string} city
   * @returns {string|null}
   */
  guestCity(city) {
    if (!city || !city.trim()) {
      return 'Cidade é obrigatória';
    }
    if (city.trim().length < 2) {
      return 'Cidade deve ter pelo menos 2 caracteres';
    }
    return null;
  },

  /**
   * Valida quantidade (de fraldas, presentes, etc)
   * @param {number|string} quantity
   * @returns {string|null}
   */
  quantity(quantity) {
    const num = Number(quantity);
    if (!num || num <= 0) {
      return 'Quantidade deve ser pelo menos 1';
    }
    if (num > 999) {
      return 'Quantidade muito grande (máx 999)';
    }
    if (!Number.isInteger(num)) {
      return 'Quantidade deve ser um número inteiro';
    }
    return null;
  },

  /**
   * Valida nome de presente
   * @param {string} name
   * @returns {string|null}
   */
  giftName(name) {
    if (!name || !name.trim()) {
      return 'Nome do presente é obrigatório';
    }
    if (name.trim().length < 3) {
      return 'Nome do presente deve ter pelo menos 3 caracteres';
    }
    return null;
  },

  /**
   * Valida URL
   * @param {string} url
   * @returns {string|null}
   */
  url(url) {
    if (!url || !url.trim()) {
      return null; // URL é opcional
    }
    try {
      new URL(url);
      return null; // válido
    } catch {
      return 'URL inválida';
    }
  },

  /**
   * Validação genérica com múltiplas regras
   * @param {object} data - Dados a validar
   * @param {object} rules - Regras (field: validatorFunction)
   * @returns {object|null} Erros por campo ou null
   */
  validate(data, rules) {
    const errors = {};
    for (const [field, validatorFn] of Object.entries(rules)) {
      const error = validatorFn(data[field]);
      if (error) {
        errors[field] = error;
      }
    }
    return Object.keys(errors).length ? errors : null;
  }
};
