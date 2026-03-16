<template>
  <div class="notifications">
    <div class="notifications-header">
      <h1>通知中心</h1>
      <div class="header-actions">
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="action-button primary">
          全部标记为已读
        </button>
        <button v-if="notifications.length > 0" @click="clearAllNotifications" class="action-button secondary">
          清除所有通知
        </button>
      </div>
    </div>
    
    <div v-if="notifications.length === 0" class="notifications-empty">
      <span class="empty-icon">📭</span>
      <h3>暂无通知</h3>
      <p>当有新的预订确认、优惠活动或系统通知时，会显示在这里</p>
    </div>
    
    <div v-else class="notifications-list">
      <div 
        v-for="notification in paginatedNotifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ 'notification-unread': !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-icon">
          {{ notification.icon || '💬' }}
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <div class="notification-actions">
              <button 
                @click.stop="toggleReadStatus(notification.id)"
                class="status-button"
                :class="{ 'read': notification.read, 'unread': !notification.read }"
              >
                {{ notification.read ? '已读' : '未读' }}
              </button>
              <button 
                @click.stop="deleteNotification(notification.id)"
                class="delete-button"
                aria-label="删除通知"
              >
                ×
              </button>
            </div>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-meta">
            <span class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</span>
            <span v-if="notification.expiration" class="notification-expiration">截止：{{ notification.expiration }}</span>
          </div>
          <div v-if="notification.actions && notification.actions.length > 0" class="notification-buttons">
            <button 
              v-for="(action, index) in notification.actions" 
              :key="index"
              @click.stop="handleNotificationAction(notification, action)"
              class="action-button small primary"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="notifications.length > pageSize" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import notificationService from '../services/notificationService'

const router = useRouter()

// 通知列表
const notifications = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 未读通知数量
const unreadCount = computed(() => {
  return notificationService.getUnreadCount()
})

// 计算分页后的通知
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return notifications.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(notifications.value.length / pageSize.value)
})

// 处理通知点击
const handleNotificationClick = (notification) => {
  markAsRead(notification.id)
  if (notification.actions && notification.actions.length > 0) {
    const action = notification.actions[0]
    if (action.url) {
      router.push(action.url)
    }
  }
}

// 处理通知操作
const handleNotificationAction = (notification, action) => {
  markAsRead(notification.id)
  if (action.url) {
    router.push(action.url)
  }
}

// 标记通知为已读
const markAsRead = (notificationId) => {
  notificationService.markAsRead(notificationId)
}

// 切换通知的已读状态
const toggleReadStatus = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    if (notification.read) {
      // 这里需要在notificationService中添加标记为未读的方法
      // 暂时先标记为已读
      notificationService.markAsRead(notificationId)
    } else {
      notificationService.markAsRead(notificationId)
    }
  }
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notificationService.markAllAsRead()
}

// 删除通知
const deleteNotification = (notificationId) => {
  notificationService.deleteNotification(notificationId)
}

// 清除所有通知
const clearAllNotifications = () => {
  notificationService.clearAllNotifications()
}

// 格式化通知时间
const formatNotificationTime = (timestamp) => {
  const now = new Date()
  const notificationTime = new Date(timestamp)
  const diffMs = now - notificationTime
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return notificationTime.toLocaleDateString()
}

// 通知更新监听器
const handleNotificationUpdate = (updatedNotifications) => {
  notifications.value = updatedNotifications
}

onMounted(() => {
  // 初始化通知
  notifications.value = notificationService.getNotifications()
  
  // 添加通知更新监听器
  notificationService.addListener(handleNotificationUpdate)
})

onUnmounted(() => {
  // 移除通知更新监听器
  notificationService.removeListener(handleNotificationUpdate)
})
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaecef;
}

.notifications-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-button.primary {
  background-color: #0969da;
  color: white;
}

.action-button.primary:hover {
  background-color: #0550ae;
}

.action-button.secondary {
  background-color: #f6f8fa;
  color: #24292e;
  border-color: #d0d7de;
}

.action-button.secondary:hover {
  background-color: #eaecef;
}

.action-button.small {
  padding: 6px 12px;
  font-size: 13px;
}

.notifications-empty {
  text-align: center;
  padding: 64px 24px;
  color: #6e7781;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.notifications-empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
  margin: 0 0 8px 0;
}

.notifications-empty p {
  font-size: 14px;
  margin: 0;
}

.notifications-list {
  margin-bottom: 32px;
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #eaecef;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: white;
}

.notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #0969da;
}

.notification-unread {
  border-left: 4px solid #0969da;
  background-color: rgba(9, 105, 218, 0.05);
}

.notification-icon {
  font-size: 24px;
  color: #0969da;
  flex-shrink: 0;
  margin-top: 4px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
  flex: 1;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-button {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.status-button.read {
  background-color: #f6f8fa;
  color: #6e7781;
  border-color: #d0d7de;
}

.status-button.unread {
  background-color: #0969da;
  color: white;
}

.delete-button {
  font-size: 18px;
  color: #6e7781;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.delete-button:hover {
  color: #cf222e;
  background-color: rgba(207, 34, 46, 0.1);
}

.notification-message {
  font-size: 14px;
  color: #57606a;
  margin: 0 0 12px 0;
  line-height: 1.5;
  word-wrap: break-word;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.notification-time {
  font-size: 12px;
  color: #6e7781;
}

.notification-expiration {
  font-size: 12px;
  color: #cf222e;
  font-weight: 500;
}

.notification-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #eaecef;
}

.pagination-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #d0d7de;
  background-color: white;
  color: #24292e;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f6f8fa;
  border-color: #0969da;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6e7781;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notifications {
    padding: 16px;
  }
  
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-button {
    flex: 1;
  }
  
  .notification-item {
    padding: 16px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .notification-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
