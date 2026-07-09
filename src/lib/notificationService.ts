export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNativeNotification = (title: string, options?: NotificationOptions) => {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
       icon: 'https://api.dicebear.com/7.x/notionists/svg?seed=Tove&backgroundColor=00C9E8',
       ...options
    });
  }
};
