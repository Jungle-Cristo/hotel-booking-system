// 通知服务
class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    this.listeners = [];
  }

  // 获取所有通知
  getNotifications() {
    return this.notifications;
  }

  // 获取未读通知数量
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // 添加通知
  addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();
    return newNotification;
  }

  // 标记通知为已读
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // 标记所有通知为已读
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
    this.notifyListeners();
  }

  // 删除通知
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifyListeners();
  }

  // 清除所有通知
  clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
  }

  // 保存通知到本地存储
  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // 添加监听器
  addListener(listener) {
    this.listeners.push(listener);
  }

  // 移除监听器
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知监听器
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.notifications);
    });
  }

  // 发送预订确认通知
  sendBookingNotification(bookingDetails) {
    return this.addNotification({
      type: 'booking',
      title: '预订确认',
      message: `您的预订已成功确认。预订时间：${bookingDetails.time}，服务：${bookingDetails.service}，地点：${bookingDetails.location || '不适用'}，预订编号：${bookingDetails.bookingId}`,
      bookingDetails,
      icon: '🎫',
      actions: [
        {
          label: '查看详情',
          url: `/bookings/${bookingDetails.bookingId}`
        }
      ]
    });
  }

  // 发送促销通知
  sendPromotionalNotification(offerDetails) {
    return this.addNotification({
      type: 'promotion',
      title: '优惠活动',
      message: offerDetails.message,
      offerDetails,
      icon: '🎁',
      actions: [
        {
          label: '立即查看',
          url: offerDetails.url || '/offers'
        }
      ],
      expiration: offerDetails.expiration
    });
  }

  // 发送系统通知
  sendSystemNotification(message) {
    return this.addNotification({
      type: 'system',
      title: '系统通知',
      message,
      icon: 'ℹ️'
    });
  }
}

// 导出单例
export default new NotificationService();
