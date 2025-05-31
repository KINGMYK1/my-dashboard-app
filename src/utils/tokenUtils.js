/**
 * Vérifie si un token JWT a expiré
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - true si le token a expiré, false sinon
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Récupération de la partie payload du JWT (partie du milieu)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Vérifier si le token est expiré
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return true; // En cas d'erreur, considérer le token comme expiré
  }
};

/**
 * Extrait la date d'expiration d'un token JWT
 * @param {string} token - Le token JWT
 * @returns {Date|null} - Date d'expiration ou null si erreur
 */
export const getTokenExpiryDate = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("Erreur lors de l'extraction de la date d'expiration:", error);
    return null;
  }
};

/**
 * ✅ NOUVEAU: Calcule le temps restant avant expiration en millisecondes
 * @param {string} token - Le token JWT
 * @returns {number} - Temps restant en millisecondes (0 si expiré)
 */
export const getTimeUntilExpiry = (token) => {
  const expiryDate = getTokenExpiryDate(token);
  if (!expiryDate) return 0;
  
  const timeLeft = expiryDate.getTime() - Date.now();
  return Math.max(0, timeLeft);
};

/**
 * ✅ NOUVEAU: Formate le temps restant en format lisible
 * @param {number} milliseconds - Temps en millisecondes
 * @returns {string} - Temps formaté (ex: "2m 30s")
 */
export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return "Expiré";
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * ✅ NOUVEAU: Vérifie si le token expire bientôt (dans les X minutes)
 * @param {string} token - Le token JWT
 * @param {number} minutesThreshold - Seuil en minutes (défaut: 5)
 * @returns {boolean} - true si le token expire bientôt
 */
export const isTokenExpiringSoon = (token, minutesThreshold = 5) => {
  const timeLeft = getTimeUntilExpiry(token);
  const thresholdMs = minutesThreshold * 60 * 1000;
  
  return timeLeft > 0 && timeLeft <= thresholdMs;
};