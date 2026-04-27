// localStorage key for saved username
const SAVED_USERNAME_KEY = 'settocbc-saved-username';

/**
 * Get saved username from localStorage
 */
export function getSavedUsername(): string {
  try {
    return localStorage.getItem(SAVED_USERNAME_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Save username to localStorage
 */
export function saveUsername(username: string): void {
  try {
    localStorage.setItem(SAVED_USERNAME_KEY, username);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear saved username
 */
export function clearSavedUsername(): void {
  try {
    localStorage.removeItem(SAVED_USERNAME_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
