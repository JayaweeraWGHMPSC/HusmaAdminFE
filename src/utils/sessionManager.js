// Session management utility
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export class SessionManager {
  static timer = null;

  // Check if user session is valid
  static isSessionValid() {
    const user = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');
    
    if (!user || !loginTime) {
      return false;
    }
    
    const elapsed = Date.now() - parseInt(loginTime);
    return elapsed < SESSION_TIMEOUT;
  }

  // Get remaining session time
  static getRemainingTime() {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return 0;
    
    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - elapsed;
    return Math.max(0, remaining);
  }

  // Setup session timeout
  static setupTimeout(onTimeout) {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    const remaining = this.getRemainingTime();
    if (remaining <= 0) {
      onTimeout();
      return;
    }
    
    // Set timer for remaining time
    this.timer = setTimeout(() => {
      this.handleTimeout(onTimeout);
    }, remaining);
  }

  // Handle session timeout
  static handleTimeout(onTimeout) {
    alert('Your session has expired. Please log in again.');
    this.clearSession();
    if (onTimeout) {
      onTimeout();
    }
  }

  // Clear session data
  static clearSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('lastLoginAt');
    localStorage.removeItem('loginTime');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // Extend session (call this on user activity)
  static extendSession() {
    const user = localStorage.getItem('user');
    if (user && this.isSessionValid()) {
      const newLoginTime = Date.now();
      localStorage.setItem('loginTime', newLoginTime.toString());
      return true;
    }
    return false;
  }

  // Get user data
  static getUser() {
    if (!this.isSessionValid()) {
      return null;
    }
    
    const userStr = localStorage.getItem('user');
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Set user data and start session
  static setUser(user) {
    const loginTime = Date.now();
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('loginTime', loginTime.toString());
    if (user.lastLoginAt) {
      localStorage.setItem('lastLoginAt', user.lastLoginAt);
    }
  }
}

// Auto-extend session on user activity
let activityTimer = null;

export const setupActivityMonitoring = (onTimeout) => {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const resetActivityTimer = () => {
    if (activityTimer) {
      clearTimeout(activityTimer);
    }
    
    // If user is inactive for 25 minutes, show warning
    activityTimer = setTimeout(() => {
      if (SessionManager.isSessionValid()) {
        const remainingMinutes = Math.ceil(SessionManager.getRemainingTime() / (1000 * 60));
        if (remainingMinutes <= 5) {
          const extend = confirm(`Your session will expire in ${remainingMinutes} minutes. Do you want to extend it?`);
          if (extend) {
            SessionManager.extendSession();
            SessionManager.setupTimeout(onTimeout);
          }
        }
      }
    }, 25 * 60 * 1000); // 25 minutes
  };

  // Add event listeners
  events.forEach(event => {
    document.addEventListener(event, resetActivityTimer, true);
  });

  // Initial setup
  resetActivityTimer();

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetActivityTimer, true);
    });
    if (activityTimer) {
      clearTimeout(activityTimer);
    }
  };
};
