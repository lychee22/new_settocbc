import { useEffect, useRef, useCallback } from 'react';
import { Modal } from 'antd';
import { useAuthStore, isSessionExpired, getRemainingTime } from '../stores/authStore';

const CHECK_INTERVAL = 1000; // Check every second

export function useSessionTimeout() {
  const { isAuthenticated, lastActivityTime, logout, updateActivity } = useAuthStore();
  const warningShownRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset warning state when user is authenticated again
  useEffect(() => {
    if (isAuthenticated) {
      warningShownRef.current = false;
    }
  }, [isAuthenticated]);

  const showWarningModal = useCallback(() => {
    if (warningShownRef.current) return;
    warningShownRef.current = true;

    let remainingSeconds = Math.floor(getRemainingTime(lastActivityTime) / 1000);

    Modal.warning({
      title: 'Session Timeout Warning',
      content: `Your session will expire in ${remainingSeconds} seconds. Do you want to continue?`,
      okText: 'Continue',
      cancelText: 'Logout',
      onOk: () => {
        updateActivity();
        warningShownRef.current = false;
      },
      onCancel: () => {
        logout();
        warningShownRef.current = false;
      },
    });

    // Update countdown every second
    countdownRef.current = setInterval(() => {
      remainingSeconds -= 1;
      if (remainingSeconds <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
        Modal.destroyAll();
        logout();
      } else {
        // Try to update the modal content
        const modals = document.querySelectorAll('.ant-modal');
        modals.forEach((modal) => {
          const content = modal.querySelector('.ant-modal-content');
          if (content && content.textContent?.includes('Your session will expire')) {
            // Update only if content changed
            const newContent = `Your session will expire in ${remainingSeconds} seconds. Do you want to continue?`;
            const contentElement = content.querySelector('.ant-modal-body');
            if (contentElement && !contentElement.textContent?.includes(`${remainingSeconds} seconds`)) {
              contentElement.textContent = newContent;
            }
          }
        });
      }
    }, 1000);
  }, [lastActivityTime, logout, updateActivity]);

  // Monitor session timeout
  useEffect(() => {
    if (!isAuthenticated || !lastActivityTime) {
      return;
    }

    const checkSession = () => {
      if (isSessionExpired(lastActivityTime)) {
        logout();
        return;
      }

      // Show warning when 1 minute left
      const remaining = getRemainingTime(lastActivityTime);
      if (remaining <= 60000 && remaining > 0) {
        showWarningModal();
      }
    };

    const timer = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      clearInterval(timer);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isAuthenticated, lastActivityTime, logout, showWarningModal]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const activities = ['click', 'keypress', 'scroll', 'mousemove'];

    const handleActivity = () => {
      updateActivity();
    };

    // Debounce activity updates
    let debounceTimer: ReturnType<typeof setTimeout>;
    const debouncedActivity = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleActivity, 1000);
    };

    activities.forEach((activity) => {
      window.addEventListener(activity, debouncedActivity);
    });

    return () => {
      activities.forEach((activity) => {
        window.removeEventListener(activity, debouncedActivity);
      });
      clearTimeout(debounceTimer);
    };
  }, [isAuthenticated, updateActivity]);
}

export default useSessionTimeout;
