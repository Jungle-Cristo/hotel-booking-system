<template>
  <div class="app">
    <header class="navbar">
      <div class="navbar-container">
        <!-- 左侧 Logo 和导航链接 -->
        <div class="navbar-left">
          <router-link to="/" class="navbar-logo">
            <span class="logo-text">酒店预订系统</span>
          </router-link>
          
          <nav class="navbar-nav">
            <router-link to="/" class="nav-item" :class="{ 'nav-item-active': currentRoute === '/' }">
              首页
            </router-link>
            <router-link to="/hotels" class="nav-item" :class="{ 'nav-item-active': currentRoute === '/hotels' }">
              酒店列表
            </router-link>
          </nav>
        </div>
        
        <!-- 中间搜索框 -->
        <div class="navbar-center">
          <div class="search-container">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索酒店、城市..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <el-button class="search-button" @click="handleSearch">搜索</el-button>
          </div>
        </div>
        
        <!-- 右侧用户菜单和通知 -->
        <div class="navbar-right">
          <!-- 通知中心 -->
          <div class="navbar-item" @click="toggleNotification" aria-label="通知中心" tabindex="0" @keydown.enter="toggleNotification" @keydown.space="toggleNotification">
            <el-badge :value="notificationCount" class="notification-badge">
              <span class="navbar-icon">🔔</span>
            </el-badge>
            <div v-if="showNotification" class="notification-dropdown" role="menu" aria-labelledby="notification-button">
              <div class="notification-header">
                <h4>通知中心</h4>
                <div class="notification-actions">
                  <router-link to="/notifications" class="notification-action-button">查看全部</router-link>
                  <button v-if="notificationCount > 0" @click="markAllAsRead" class="notification-action-button">全部已读</button>
                  <button v-if="notifications.length > 0" @click="clearAllNotifications" class="notification-action-button">清除全部</button>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="notification-empty">
                <span class="empty-icon">📭</span>
                <p>暂无通知</p>
              </div>
              <div v-else class="notification-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'notification-unread': !notification.read }"
                  @click="handleNotificationClick(notification)"
                  role="menuitem"
                  tabindex="0"
                  @keydown.enter="handleNotificationClick(notification)"
                  @keydown.space="handleNotificationClick(notification)"
                >
                  <span class="notification-icon">{{ notification.icon || '💬' }}</span>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-meta">
                      <span class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</span>
                      <span v-if="notification.expiration" class="notification-expiration">截止：{{ notification.expiration }}</span>
                    </div>
                    <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
                      <button 
                        v-for="(action, index) in notification.actions" 
                        :key="index"
                        @click.stop="handleNotificationAction($event, notification, action)"
                        class="notification-action-button"
                      >
                        {{ action.label }}
                      </button>
                    </div>
                  </div>
                  <button 
                    @click.stop="deleteNotification($event, notification.id)"
                    class="notification-delete-button"
                    aria-label="删除通知"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 用户菜单 -->
          <div class="navbar-item" @click="toggleUserMenu">
            <div class="user-avatar" v-if="isLoggedIn">
              <span class="avatar-text">{{ userInfo.name?.charAt(0) || 'U' }}</span>
            </div>
            <span v-else class="navbar-icon">👤</span>
            <div v-if="showUserMenu" class="user-dropdown">
              <div v-if="isLoggedIn" class="user-info">
                <div class="user-name">{{ userInfo.name || '用户' }}</div>
                <div class="user-email">{{ userInfo.email || 'user@example.com' }}</div>
              </div>
              <div class="user-menu">
                <router-link to="/login" v-if="!isLoggedIn" class="user-menu-item">
                  <span class="menu-icon">👤</span>
                  <span>登录</span>
                </router-link>
                <router-link to="/register" v-if="!isLoggedIn" class="user-menu-item">
                  <span class="menu-icon">➕</span>
                  <span>注册</span>
                </router-link>
                <router-link to="/profile" class="user-menu-item">
                  <span class="menu-icon">👤</span>
                  <span>个人资料</span>
                </router-link>
                <router-link to="/bookings" class="user-menu-item">
                  <span class="menu-icon">🎫</span>
                  <span>我的预订</span>
                </router-link>
                <div class="user-menu-item logout-item" @click="handleLogout">
                  <span class="menu-icon">🔄</span>
                  <span>退出登录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-info">
          © 2026 酒店预订系统 - 版权所有
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <a href="#" class="footer-link">服务条款</a>
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">联系我们</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useUserStore from './store/user'
import notificationService from './services/notificationService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 搜索相关
const searchQuery = ref('')

// 通知相关
const showNotification = ref(false)
const notifications = ref([])

// 用户菜单相关
const showUserMenu = ref(false)

// 当前路由
const currentRoute = computed(() => route.path)

// 用户状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.userInfo)

// 未读通知数量
const notificationCount = computed(() => {
  return notificationService.getUnreadCount()
})

// 切换通知下拉菜单
const toggleNotification = () => {
  showNotification.value = !showNotification.value
  if (showNotification.value) {
    showUserMenu.value = false
  }
}

// 切换用户下拉菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showNotification.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/hotels?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const navbarItems = event.target.closest('.navbar-item')
  if (!navbarItems) {
    showNotification.value = false
    showUserMenu.value = false
  }
}

// 监听路由变化
watch(() => route.path, () => {
  showNotification.value = false
  showUserMenu.value = false
})

// 标记通知为已读
const markAsRead = (notificationId) => {
  notificationService.markAsRead(notificationId)
}

// 标记所有通知为已读
const markAllAsRead = () => {
  notificationService.markAllAsRead()
}

// 删除通知
const deleteNotification = (event, notificationId) => {
  event.stopPropagation()
  notificationService.deleteNotification(notificationId)
}

// 清除所有通知
const clearAllNotifications = () => {
  notificationService.clearAllNotifications()
}

// 处理通知点击
const handleNotificationClick = (notification) => {
  markAsRead(notification.id)
  if (notification.actions && notification.actions.length > 0) {
    const action = notification.actions[0]
    if (action.url) {
      router.push(action.url)
    }
  }
  showNotification.value = false
}

// 处理通知操作
const handleNotificationAction = (event, notification, action) => {
  event.stopPropagation()
  markAsRead(notification.id)
  if (action.url) {
    router.push(action.url)
  }
  showNotification.value = false
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
  // 初始化用户信息
  userStore.initUser()
  
  // 初始化通知
  notifications.value = notificationService.getNotifications()
  
  // 添加通知更新监听器
  notificationService.addListener(handleNotificationUpdate)
  
  // 添加点击外部关闭下拉菜单的事件监听器
  document.addEventListener('click', handleClickOutside)
  
  // 添加滚动事件监听器
  window.addEventListener('scroll', handleScroll)
  
  // 测试通知
  if (notifications.value.length === 0) {
    // 发送测试预订通知
    notificationService.sendBookingNotification({
      time: '2026-03-15 14:00',
      service: '豪华双人房',
      location: '上海浦东',
      bookingId: 'BK123456'
    })
    
    // 发送测试促销通知
    notificationService.sendPromotionalNotification({
      message: '限时优惠：预订任意酒店享受8折优惠，截止日期：2026-03-31',
      url: '/hotels?offer=80off',
      expiration: '2026-03-31'
    })
    
    // 发送测试系统通知
    notificationService.sendSystemNotification('系统已更新至最新版本，新增多项功能')
  }
})

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
  notificationService.removeListener(handleNotificationUpdate)
})

// 处理滚动事件
const handleScroll = () => {
  const navbar = document.querySelector('.navbar')
  if (navbar) {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  background-color: var(--card-bg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.2s ease;
}

.navbar:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 左侧 Logo 和导航链接 */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #24292e;
  font-size: 20px;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 8px 0;
}

.navbar-logo:hover {
  color: #0969da;
  transform: translateY(-1px);
}

.logo-text {
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.navbar-nav {
  display: flex;
  gap: 16px;
}

.nav-item {
  text-decoration: none;
  color: #57606a;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  color: #0969da;
  background-color: rgba(175, 184, 193, 0.2);
}

.nav-item-active {
  color: #0969da;
  background-color: rgba(175, 184, 193, 0.2);
  font-weight: 600;
}

/* 中间搜索框 */
.navbar-center {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-input {
  flex: 1;
  height: 36px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: #f6f8fa;
}

.search-input:focus {
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
  background-color: white;
}

.search-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  background-color: #2da44e;
  color: white;
  border: 1px solid rgba(27, 31, 36, 0.15);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.search-button:hover {
  background-color: #2c974b;
  box-shadow: 0 1px 3px rgba(27, 31, 36, 0.1);
  transform: translateY(-1px);
}

/* 右侧用户菜单和通知 */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-item {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.navbar-item:hover {
  background-color: rgba(175, 184, 193, 0.2);
}

.navbar-icon {
  font-size: 18px;
  color: #57606a;
  transition: color 0.2s ease;
}

.navbar-item:hover .navbar-icon {
  color: #0969da;
}

/* 通知中心 */
.notification-badge {
  --el-badge-background-color: #cf222e;
  --el-badge-font-size: 10px;
  --el-badge-min-width: 16px;
  --el-badge-height: 16px;
  --el-badge-padding: 0 4px;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideIn 0.2s ease-out;
  border: 1px solid #eaecef;
}

.notification-header {
  padding: 16px;
  border-bottom: 1px solid #eaecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f6f8fa;
  border-radius: 6px 6px 0 0;
}

.notification-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
}

.notification-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notification-action-button {
  font-size: 12px;
  color: #0969da;
  background: none;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.notification-action-button:hover {
  background-color: rgba(9, 105, 218, 0.1);
  color: #0550ae;
}

.notification-empty {
  padding: 48px 16px;
  text-align: center;
  color: #6e7781;
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 16px;
}

.notification-empty p {
  margin: 0;
  font-size: 14px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  position: relative;
}

.notification-item:hover {
  background-color: #f6f8fa;
}

.notification-unread {
  background-color: rgba(9, 105, 218, 0.05);
}

.notification-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #0969da;
  opacity: 1;
}

.notification-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #0969da;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover::before {
  opacity: 1;
}

.notification-icon {
  font-size: 16px;
  color: #0969da;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-message {
  font-size: 13px;
  color: #57606a;
  margin-bottom: 8px;
  line-height: 1.4;
  word-wrap: break-word;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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

.notification-delete-button {
  font-size: 16px;
  color: #6e7781;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
  opacity: 0;
}

.notification-item:hover .notification-delete-button {
  opacity: 1;
}

.notification-delete-button:hover {
  color: #cf222e;
  background-color: rgba(207, 34, 46, 0.1);
}

/* 通知列表滚动条样式 */
.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 用户菜单 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0969da, #0550ae);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: rgba(9, 105, 218, 0.3);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 240px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideIn 0.2s ease-out;
  border: 1px solid #eaecef;
}

.user-info {
  padding: 16px;
  border-bottom: 1px solid #eaecef;
  background-color: #f6f8fa;
  border-radius: 6px 6px 0 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #57606a;
}

.user-menu {
  padding: 4px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #57606a;
  font-size: 14px;
  font-weight: 400;
}

.user-menu-item:hover {
  background-color: #f6f8fa;
  color: #0969da;
}

.logout-item {
  cursor: pointer;
  margin-top: 4px;
  color: #cf222e;
}

.logout-item:hover {
  background-color: rgba(207, 34, 46, 0.1);
  color: #cf222e;
}

.menu-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 页脚 */
.footer {
  background-color: #f6f8fa;
  border-top: 1px solid #eaecef;
  padding: 24px 0;
  margin-top: 32px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-info {
  font-size: 12px;
  color: #6e7781;
  text-align: center;
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  font-size: 12px;
  color: #57606a;
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 400;
}

.footer-link:hover {
  color: #0969da;
  text-decoration: underline;
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 滚动时的导航栏效果 */
.navbar.scrolled {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background-color: white;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 20px;
  }
  
  .navbar-left {
    gap: 20px;
  }
  
  .navbar-center {
    margin: 0 20px;
    max-width: 300px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .footer-container {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
    height: 56px;
  }
  
  .navbar-left {
    gap: 16px;
  }
  
  .navbar-logo {
    font-size: 18px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .navbar-center {
    display: none;
  }
  
  .navbar-right {
    gap: 8px;
  }
  
  .navbar-item {
    min-width: 36px;
    height: 36px;
    padding: 6px;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -16px;
  }
  
  .user-dropdown {
    width: 200px;
    right: -16px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .footer-links {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .navbar-nav {
    display: none;
  }
  
  .navbar-item {
    padding: 6px;
  }
  
  .navbar-icon {
    font-size: 16px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
  
  .notification-dropdown {
    width: 260px;
    right: -24px;
  }
  
  .user-dropdown {
    width: 180px;
    right: -24px;
  }
  
  .main-content {
    padding: 12px;
  }
}
</style>