<template>
  <div class="login">
    <div class="login-container">
      <div class="login-header fade-in">
        <div class="login-logo">
          <el-icon class="logo-icon"><House /></el-icon>
        </div>
        <h1 class="login-title">酒店预订系统</h1>
        <p class="login-subtitle">登录您的账户以继续</p>
      </div>
      
      <div class="login-form-card hover-lift">
        <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
          <el-form-item prop="username" class="form-item">
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名或邮箱"
                class="login-input"
                autocomplete="username"
                :class="{ 'is-focused': focusedField === 'username' }"
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
              />
            </div>
          </el-form-item>
          
          <el-form-item prop="password" class="form-item">
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码"
                class="login-input"
                show-password
                autocomplete="current-password"
                :class="{ 'is-focused': focusedField === 'password' }"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
            </div>
          </el-form-item>
          
          <div class="login-options">
            <el-checkbox v-model="rememberMe" class="remember-checkbox" size="large">
              <span class="checkbox-label">记住我</span>
            </el-checkbox>
            <a href="#" class="forgot-password" @click.prevent>忘记密码？</a>
          </div>
          
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              @click="submitLogin" 
              class="login-button"
              :loading="loading"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>
          
          <div class="register-link">
            还没有账号？<a href="#" @click.prevent="goToRegister" class="register-link-text">立即注册</a>
          </div>
          
          <div class="divider">
            <span class="divider-text">或</span>
          </div>
          
          <div class="social-login">
            <el-button class="social-button google" size="large">
              <el-icon class="social-icon"><Share /></el-icon>
              <span>使用 Google 登录</span>
            </el-button>
            <el-button class="social-button github" size="large">
              <el-icon class="social-icon"><Link /></el-icon>
              <span>使用 GitHub 登录</span>
            </el-button>
          </div>
        </el-form>
      </div>
      
      <div class="login-footer">
        <p class="footer-text">© 2026 酒店预订系统. 保留所有权利.</p>
        <div class="footer-links">
          <a href="#" class="footer-link">隐私政策</a>
          <span class="footer-separator">·</span>
          <a href="#" class="footer-link">服务条款</a>
          <span class="footer-separator">·</span>
          <a href="#" class="footer-link">帮助中心</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Share, Link, House } from '@element-plus/icons-vue'
import useUserStore from '../store/user'
import { userApi } from '../api'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loginForm = ref({
  username: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const focusedField = ref('')

const rules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const submitLogin = async () => {
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await userApi.login(loginForm.value)
    // userStore.login(response.userInfo, response.token)
    
    // 从 localStorage 中获取注册信息
    const registeredUser = localStorage.getItem('registeredUser')
    let userInfo
    
    if (registeredUser) {
      // 使用注册时存储的信息
      userInfo = JSON.parse(registeredUser)
    } else {
      // 使用默认模拟数据
      userInfo = {
        id: 1,
        username: loginForm.value.username,
        name: loginForm.value.username,
        phone: '13812345678',
        email: `${loginForm.value.username}@example.com`
      }
    }
    
    // 登录并存储用户信息
    userStore.login(userInfo, 'mock-token-123456')
    
    // 模拟网络延迟
    setTimeout(() => {
      loading.value = false
      router.push('/')
    }, 500)
  } catch (error) {
    console.error('登录失败:', error)
    loading.value = false
  }
}

const goToRegister = () => {
  // 跳转到注册页面
  router.push('/register')
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-color) 100%);
  padding: var(--spacing-md);
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(22, 93, 255, 0.05) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-10%, -10%) rotate(5deg);
  }
}

.login-container {
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
  animation: fadeIn var(--transition-slow);
}

.login-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-active));
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  box-shadow: var(--shadow-lg);
  animation: slideIn var(--transition-normal);
}

.logo-icon {
  font-size: 32px;
  color: white;
}

.login-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.5px;
  animation: fadeIn var(--transition-normal) 0.2s both;
}

.login-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  animation: fadeIn var(--transition-normal) 0.4s both;
}

.login-form-card {
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-normal) 0.6s both;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: var(--spacing-lg);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  background-color: var(--card-bg);
  overflow: hidden;
  width: 100%;
}

.input-wrapper:focus-within,
.input-wrapper.is-focused {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
  transform: translateY(-1px);
}

.input-icon {
  color: var(--text-tertiary);
  font-size: 20px;
  margin: 0 var(--spacing-md);
  transition: color var(--transition-fast);
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrapper:focus-within .input-icon,
.input-wrapper.is-focused .input-icon {
  color: var(--primary-color);
}

.login-input {
  flex: 1;
  height: 56px;
  border: none;
  outline: none;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background: transparent;
  padding: 0 var(--spacing-md);
  min-width: 0;
}

.login-input::placeholder {
  color: var(--text-quaternary);
  font-size: var(--font-size-md);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-md) 0 var(--spacing-lg);
}

.remember-checkbox {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label {
  margin-left: var(--spacing-sm);
}

.forgot-password {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.forgot-password:hover {
  color: var(--primary-hover);
  text-decoration: underline;
  transform: translateY(-1px);
}

.login-button {
  width: 100%;
  height: 56px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-active));
  border: none;
  transition: all var(--transition-fast);
  color: white;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.login-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.register-link {
  text-align: center;
  margin: var(--spacing-lg) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.register-link-text {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.register-link-text:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.divider {
  position: relative;
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xl) 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-text {
  position: relative;
  background-color: var(--card-bg);
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.social-button {
  width: 100%;
  height: 56px;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
  overflow: hidden;
}

.social-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.social-button:hover::before {
  left: 100%;
}

.social-icon {
  font-size: 20px;
}

.social-button.google {
  border: 1px solid var(--border-color);
  background-color: var(--card-bg);
  color: var(--text-primary);
}

.social-button.google:hover {
  background-color: rgba(22, 93, 255, 0.05);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.social-button.github {
  border: 1px solid #333;
  background-color: #333;
  color: white;
}

.social-button.github:hover {
  background-color: #444;
  border-color: #444;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.login-footer {
  margin-top: var(--spacing-md);
  text-align: center;
  animation: fadeIn var(--transition-normal) 0.8s both;
}

.footer-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin: 0 0 var(--spacing-sm);
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.footer-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-separator {
  font-size: var(--font-size-xs);
  color: var(--text-quaternary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form-card {
    padding: var(--spacing-lg);
  }
  
  .login-title {
    font-size: var(--font-size-xl);
  }
  
  .login-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .login-logo {
    width: 56px;
    height: 56px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .login {
    padding: var(--spacing-sm);
  }
  
  .login-form-card {
    padding: var(--spacing-md);
  }
  
  .login-title {
    font-size: var(--font-size-lg);
  }
  
  .login-input,
  .login-button,
  .social-button {
    height: 48px;
  }
  
  .input-icon,
  .social-icon {
    font-size: 18px;
  }
  
  .login-logo {
    width: 48px;
    height: 48px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .login::before {
    animation: none;
  }
  
  .login-header,
  .login-title,
  .login-subtitle,
  .login-form-card,
  .login-footer {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .input-wrapper {
    border-width: 2px;
  }
  
  .login-button {
    border: 2px solid var(--primary-color);
  }
}
</style>