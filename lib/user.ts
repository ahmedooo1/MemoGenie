// 🔐 Gestion simple de l'identité utilisateur via localStorage
// Chaque utilisateur a un ID unique généré côté client

const USER_ID_KEY = 'memogenie_user_id';

/**
 * Génère un ID utilisateur unique
 */
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Récupère ou crée l'ID utilisateur
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    // Côté serveur - retourner un ID temporaire
    return 'anonymous';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('🆔 Nouvel utilisateur créé:', userId);
  }
  
  return userId;
}

/**
 * Réinitialise l'ID utilisateur (pour tester ou changer d'utilisateur)
 */
export function resetUserId(): string {
  const newUserId = generateUserId();
  localStorage.setItem(USER_ID_KEY, newUserId);
  console.log('🔄 ID utilisateur réinitialisé:', newUserId);
  return newUserId;
}

/**
 * Vérifie si l'utilisateur a un ID
 */
export function hasUserId(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(USER_ID_KEY);
}
