/**
 * Service de gestion des icônes gaming avec logos de consoles
 */

// ✅ Base64 des logos principaux (optimisés pour la performance)
const GAMING_LOGOS = {
  // PlayStation logos
  playstation: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNzBGMyIvPgo8cGF0aCBkPSJNMTIgMTJIMTZWMjhIMTJWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgMTJIMjhWMTZIMjBWMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgMjBIMjhWMjRIMjBWMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjAgMjhIMjhWMzJIMjBWMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
  
  ps4: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwN0NGNyIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QUzQ8L3RleHQ+Cjwvc3ZnPgo=",
  
  ps5: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwODdGRiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QUzU8L3RleHQ+Cjwvc3ZnPgo=",

  // Xbox logos
  xbox: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzEwN0MxMCIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xNiAxNkwyNCAyNE0yNCAxNkwxNiAyNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==",
  
  xbox360: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzEwN0MxMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5YQk9YPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4zNjA8L3RleHQ+Cjwvc3ZnPgo=",
  
  xboxone: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzEwN0MxMCIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5YQk9YIDFYPC90ZXh0Pgo8L3N2Zz4K",

  // Nintendo logos
  nintendo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0U2MDAxMiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OSU5URU5ETzwvdGV4dD4KPC9zdmc+Cg==",
  
  switch: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0U2MDAxMiIvPgo8cmVjdCB4PSIxMCIgeT0iMTIiIHdpZHRoPSI2IiBoZWlnaHQ9IjE2IiByeD0iMSIgZmlsbD0iIzAwN0FDQyIvPgo8cmVjdCB4PSIyNCIgeT0iMTIiIHdpZHRoPSI2IiBoZWlnaHQ9IjE2IiByeD0iMSIgZmlsbD0iI0ZGNTc1NyIvPgo8cmVjdCB4PSIxNiIgeT0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",

  // PC Gaming
  pc: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzNBM0E0MiIvPgo8cmVjdCB4PSI4IiB5PSIxMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzFGMUYyMyIgc3Ryb2tlPSIjNjY2NjZEIiBzdHJva2Utd2lkdGg9IjEiLz4KPHJlY3QgeD0iMTQiIHk9IjI4IiB3aWR0aD0iMTIiIGhlaWdodD0iMiIgZmlsbD0iIzY2NjY2RCIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE4IiByPSIzIiBmaWxsPSIjMDBGRjAwIi8+CjwvdXZnPgo=",
  
  // Mobiles
  mobile: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzJEMkQzMCIvPgo8cmVjdCB4PSIxNCIgeT0iOCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iIzFGMUYyMyIgc3Ryb2tlPSIjNjY2NjZEIiBzdHJva2Utd2lkdGg9IjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyNiIgcj0iMSIgZmlsbD0iIzY2NjY2RCIvPgo8L3N2Zz4K",

  // Retro Gaming
  retro: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzhCNUNGNiIvPgo8cmVjdCB4PSIxMCIgeT0iMTQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMiIgcng9IjIiIGZpbGw9IiM2ODQ4QUEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==",

  // VR
  vr: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwRkZGRiIvPgo8ZWxsaXBzZSBjeD0iMjAiIGN5PSIyMCIgcng9IjEyIiByeT0iOCIgZmlsbD0iIzAwQkNENCIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE4IiByPSIyIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjE4IiByPSIyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",

  // Generic Gaming
  gaming: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2NjY2RCIvPgo8cmVjdCB4PSI4IiB5PSIxNiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjM0EzQTQyIi8+CjxjaXJjbGUgY3g9IjE0IiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIyNiIgY3k9IjIwIiByPSIxLjUiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg=="
};

// ✅ Catégories d'icônes avec leurs options
export const GAMING_CATEGORIES = {
  consoles: {
    name: 'Consoles',
    icons: {
      playstation: { name: 'PlayStation', logo: GAMING_LOGOS.playstation, color: '#0070F3' },
      ps4: { name: 'PlayStation 4', logo: GAMING_LOGOS.ps4, color: '#007CF7' },
      ps5: { name: 'PlayStation 5', logo: GAMING_LOGOS.ps5, color: '#0087FF' },
      xbox: { name: 'Xbox', logo: GAMING_LOGOS.xbox, color: '#107C10' },
      xbox360: { name: 'Xbox 360', logo: GAMING_LOGOS.xbox360, color: '#107C10' },
      xboxone: { name: 'Xbox One/Series', logo: GAMING_LOGOS.xboxone, color: '#107C10' },
      nintendo: { name: 'Nintendo', logo: GAMING_LOGOS.nintendo, color: '#E60012' },
      switch: { name: 'Nintendo Switch', logo: GAMING_LOGOS.switch, color: '#E60012' },
    }
  },
  platforms: {
    name: 'Plateformes',
    icons: {
      pc: { name: 'PC Gaming', logo: GAMING_LOGOS.pc, color: '#3A3A42' },
      mobile: { name: 'Mobile Gaming', logo: GAMING_LOGOS.mobile, color: '#2D2D30' },
      vr: { name: 'VR Gaming', logo: GAMING_LOGOS.vr, color: '#00FFFF' },
      retro: { name: 'Retro Gaming', logo: GAMING_LOGOS.retro, color: '#8B5CF6' },
    }
  },
  generic: {
    name: 'Générique',
    icons: {
      gaming: { name: 'Gaming Standard', logo: GAMING_LOGOS.gaming, color: '#66666D' },
    }
  }
};

// ✅ Emojis gaming comme alternative
export const GAMING_EMOJIS = {
  controller: '🎮',
  joystick: '🕹️',
  computer: '💻',
  mobile: '📱',
  headset: '🎧',
  trophy: '🏆',
  fire: '🔥',
  lightning: '⚡',
  star: '⭐',
  gem: '💎',
  rocket: '🚀',
  sword: '⚔️',
  shield: '🛡️',
  crown: '👑'
};

class GamingIconService {
  /**
   * Obtenir toutes les catégories d'icônes
   */
  static getCategories() {
    return GAMING_CATEGORIES;
  }

  /**
   * Obtenir une icône par clé
   */
  static getIcon(iconKey) {
    for (const category of Object.values(GAMING_CATEGORIES)) {
      if (category.icons[iconKey]) {
        return category.icons[iconKey];
      }
    }
    return null;
  }

  /**
   * Obtenir toutes les icônes dans une liste plate
   */
  static getAllIcons() {
    const icons = {};
    Object.values(GAMING_CATEGORIES).forEach(category => {
      Object.assign(icons, category.icons);
    });
    return icons;
  }

  /**
   * Rendre une icône (logo ou emoji)
   */
  static renderIcon(iconKey, size = 32, className = '') {
    // Vérifier si c'est un emoji
    if (GAMING_EMOJIS[iconKey]) {
      return {
        type: 'emoji',
        content: GAMING_EMOJIS[iconKey],
        style: { fontSize: `${size}px` }
      };
    }

    // Vérifier si c'est un logo
    const icon = this.getIcon(iconKey);
    if (icon) {
      return {
        type: 'logo',
        content: icon.logo,
        color: icon.color,
        style: { width: `${size}px`, height: `${size}px` }
      };
    }

    // Par défaut, emoji gaming
    return {
      type: 'emoji',
      content: GAMING_EMOJIS.gaming || '🎮',
      style: { fontSize: `${size}px` }
    };
  }

  /**
   * Obtenir les suggestions d'icônes basées sur le nom du type
   */
  static getSuggestedIcons(typeName) {
    const name = typeName.toLowerCase();
    const suggestions = [];

    // PlayStation
    if (name.includes('playstation') || name.includes('ps')) {
      if (name.includes('5')) suggestions.push('ps5');
      else if (name.includes('4')) suggestions.push('ps4');
      else suggestions.push('playstation');
    }

    // Xbox
    else if (name.includes('xbox')) {
      if (name.includes('one') || name.includes('series')) suggestions.push('xboxone');
      else if (name.includes('360')) suggestions.push('xbox360');
      else suggestions.push('xbox');
    }

    // Nintendo
    else if (name.includes('nintendo') || name.includes('switch')) {
      if (name.includes('switch')) suggestions.push('switch');
      else suggestions.push('nintendo');
    }

    // PC
    else if (name.includes('pc') || name.includes('ordinateur') || name.includes('computer')) {
      suggestions.push('pc');
    }

    // VR
    else if (name.includes('vr') || name.includes('virtuel') || name.includes('virtual')) {
      suggestions.push('vr');
    }

    // Mobile
    else if (name.includes('mobile') || name.includes('phone') || name.includes('tablet')) {
      suggestions.push('mobile');
    }

    // Retro
    else if (name.includes('retro') || name.includes('vintage') || name.includes('classic')) {
      suggestions.push('retro');
    }

    // Par défaut
    if (suggestions.length === 0) {
      suggestions.push('gaming', 'controller');
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }

  /**
   * Générer des couleurs gaming basées sur les tendances
   */
  static getGamingColors() {
    return [
      '#8B5CF6', // Purple gaming
      '#00FFFF', // Cyan gaming
      '#FF00FF', // Magenta gaming
      '#00FF41', // Matrix green
      '#FF6B35', // Gaming orange
      '#0070F3', // PlayStation blue
      '#107C10', // Xbox green
      '#E60012', // Nintendo red
      '#FFD700', // Gold
      '#FF1744', // Neon red
      '#00E676', // Neon green
      '#2979FF', // Electric blue
    ];
  }
}

export default GamingIconService;