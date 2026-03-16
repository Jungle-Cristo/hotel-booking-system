<template>
  <div class="register">
    <div class="register-container">
      <div class="register-header fade-in">
        <div class="register-logo">
          <el-icon class="logo-icon"><House /></el-icon>
        </div>
        <h1 class="register-title">酒店预订系统</h1>
        <p class="register-subtitle">创建您的账户以开始预订</p>
      </div>
      
      <div class="register-form-card hover-lift">
        <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
          <el-form-item prop="username" class="form-item">
            <div class="input-wrapper" :class="{ 'is-error': errors.username, 'is-focused': focusedField === 'username' }">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input 
                v-model="registerForm.username" 
                placeholder="请输入用户名" 
                class="register-input"
                autocomplete="username"
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
              />
            </div>
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </el-form-item>
          
          <el-form-item prop="email" class="form-item">
            <div class="input-wrapper" :class="{ 'is-error': errors.email, 'is-focused': focusedField === 'email' }">
              <el-icon class="input-icon"><Message /></el-icon>
              <el-input 
                v-model="registerForm.email" 
                type="email" 
                placeholder="请输入电子邮箱" 
                class="register-input"
                autocomplete="email"
                @focus="focusedField = 'email'"
                @blur="focusedField = ''"
              />
            </div>
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </el-form-item>
          
          <el-form-item prop="password" class="form-item">
            <div class="input-wrapper" :class="{ 'is-error': errors.password, 'is-focused': focusedField === 'password' }">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码" 
                show-password 
                class="register-input"
                autocomplete="new-password"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
            </div>
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
            <div v-if="passwordStrength > 0" class="password-strength">
              <div class="strength-label">密码强度：</div>
              <div class="strength-bars">
                <div 
                  v-for="i in 3" 
                  :key="i"
                  class="strength-bar"
                  :class="{ 'strength-weak': i === 1 && passwordStrength >= 1, 'strength-medium': i === 2 && passwordStrength >= 2, 'strength-strong': i === 3 && passwordStrength >= 3 }"
                ></div>
              </div>
              <div class="strength-text" v-if="passwordStrength === 1">弱</div>
              <div class="strength-text" v-else-if="passwordStrength === 2">中</div>
              <div class="strength-text" v-else-if="passwordStrength === 3">强</div>
            </div>
          </el-form-item>
          
          <el-form-item prop="confirmPassword" class="form-item">
            <div class="input-wrapper" :class="{ 'is-error': errors.confirmPassword, 'is-focused': focusedField === 'confirmPassword' }">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请确认密码" 
                show-password 
                class="register-input"
                autocomplete="new-password"
                @focus="focusedField = 'confirmPassword'"
                @blur="focusedField = ''"
              />
            </div>
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
          </el-form-item>
          
          <el-form-item prop="phone" class="form-item">
            <div class="input-wrapper" :class="{ 'is-error': errors.phone, 'is-focused': focusedField === 'phone' }">
              <el-icon class="input-icon"><Phone /></el-icon>
              <el-input 
                v-model="registerForm.phone" 
                placeholder="请输入手机号码" 
                class="register-input"
                autocomplete="tel"
                @focus="focusedField = 'phone'"
                @blur="focusedField = ''"
              />
            </div>
            <div v-if="errors.phone" class="form-error">{{ errors.phone }}</div>
          </el-form-item>
          
          <el-form-item prop="agreeTerms" class="form-item terms-item">
            <el-checkbox v-model="registerForm.agreeTerms" class="terms-checkbox" size="large">
              <span class="checkbox-label">
                我已阅读并同意 <a href="#" @click.prevent class="terms-link">用户协议</a> 和 <a href="#" @click.prevent class="terms-link">隐私政策</a>
              </span>
            </el-checkbox>
            <div v-if="errors.agreeTerms" class="form-error">{{ errors.agreeTerms }}</div>
          </el-form-item>
          
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              @click="submitRegister" 
              class="register-button"
              :loading="loading"
              size="large"
            >
              注册
            </el-button>
          </el-form-item>
          
          <div class="login-link">
            已有账号？<a href="#" @click.prevent="goToLogin" class="login-link-text">立即登录</a>
          </div>
        </el-form>
      </div>
      
      <div class="register-footer">
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { User, Message, Lock, Phone, House } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { userApi } from '../api'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)
const focusedField = ref('')

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeTerms: false
})

const errors = ref({})

// 密码强度检测
const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) strength++
  
  return strength
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的电子邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少为 8 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
  ],
  agreeTerms: [
    { required: true, message: '请阅读并同意用户协议和隐私政策', trigger: 'change' }
  ]
}

// 实时验证
watch(() => registerForm.value.username, (newVal) => {
  if (newVal) {
    delete errors.value.username
  }
})

watch(() => registerForm.value.email, (newVal) => {
  if (newVal) {
    delete errors.value.email
  }
})

watch(() => registerForm.value.password, (newVal) => {
  if (newVal) {
    delete errors.value.password
  }
  if (registerForm.value.confirmPassword) {
    if (newVal === registerForm.value.confirmPassword) {
      delete errors.value.confirmPassword
    }
  }
})

watch(() => registerForm.value.confirmPassword, (newVal) => {
  if (newVal && newVal === registerForm.value.password) {
    delete errors.value.confirmPassword
  }
})

watch(() => registerForm.value.phone, (newVal) => {
  if (newVal) {
    delete errors.value.phone
  }
})

watch(() => registerForm.value.agreeTerms, (newVal) => {
  if (newVal) {
    delete errors.value.agreeTerms
  }
})

// 提交注册
const submitRegister = async () => {
  try {
    await registerFormRef.value.validate()
    
    loading.value = true
    
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await userApi.register(registerForm.value)
    
    // 模拟注册成功
    setTimeout(() => {
      loading.value = false
      
      // 存储注册信息到 localStorage，以便登录时使用
      const userInfo = {
        id: Date.now(),
        username: registerForm.value.username,
        name: registerForm.value.username, // 可以根据实际情况修改
        phone: registerForm.value.phone,
        email: registerForm.value.email
      }
      localStorage.setItem('registeredUser', JSON.stringify(userInfo))
      
      // 显示成功提示
      ElMessage.success('注册成功，请登录')
      
      // 跳转到登录页面
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.error('注册失败:', error)
    loading.value = false
    
    // 处理表单验证错误
    if (error.errors) {
      error.errors.forEach(item => {
        errors.value[item.field] = item.message
      })
    }
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--bg-color) 100%);
  padding: var(--spacing-md);
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.register::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 125, 0, 0.05) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(10%, 10%) rotate(5deg);
  }
}

.register-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-md);
  animation: fadeIn var(--transition-slow);
}

.register-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-active));
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

.register-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.5px;
  animation: fadeIn var(--transition-normal) 0.2s both;
}

.register-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin: 0;
  animation: fadeIn var(--transition-normal) 0.4s both;
}

.register-form-card {
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-normal) 0.6s both;
  max-height: 90vh;
  overflow-y: auto;
}

.register-form {
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
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(255, 125, 0, 0.1);
  transform: translateY(-1px);
}

.input-wrapper.is-error {
  border-color: var(--error-color) !important;
  box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.1);
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
  color: var(--accent-color);
}

.input-wrapper.is-error .input-icon {
  color: var(--error-color);
}

.register-input {
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

.register-input::placeholder {
  color: var(--text-quaternary);
  font-size: var(--font-size-md);
}

.form-error {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--error-color);
  background-color: var(--error-light);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--error-color);
  animation: slideIn var(--transition-fast);
}

.password-strength {
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  animation: fadeIn var(--transition-fast);
}

.strength-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}

.strength-bars {
  flex: 1;
  display: flex;
  gap: var(--spacing-xs);
}

.strength-bar {
  flex: 1;
  height: 8px;
  background-color: var(--border-color);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.strength-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-normal);
}

.strength-bar:hover::before {
  left: 100%;
}

.strength-weak {
  background-color: var(--error-color);
}

.strength-medium {
  background-color: var(--warning-color);
}

.strength-strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  min-width: 36px;
  text-align: right;
  transition: all var(--transition-fast);
}

.strength-text:nth-child(3) {
  color: var(--error-color);
}

.strength-text:nth-child(4) {
  color: var(--warning-color);
}

.strength-text:nth-child(5) {
  color: var(--success-color);
}

.terms-item {
  margin: var(--spacing-md) 0;
}

.terms-checkbox {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label {
  margin-left: var(--spacing-sm);
  line-height: var(--line-height-md);
}

.terms-link {
  color: var(--accent-color);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
}

.terms-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.register-button {
  width: 100%;
  height: 56px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  background: linear-gradient(135deg, var(--accent-color), var(--accent-active));
  border: none;
  transition: all var(--transition-fast);
  color: white;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-normal);
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.register-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.register-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.login-link {
  text-align: center;
  margin: var(--spacing-lg) 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.login-link-text {
  color: var(--accent-color);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.login-link-text:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.register-footer {
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
  color: var(--accent-color);
}

.footer-separator {
  font-size: var(--font-size-xs);
  color: var(--text-quaternary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form-card {
    padding: var(--spacing-lg);
  }
  
  .register-title {
    font-size: var(--font-size-xl);
  }
  
  .register-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .register-logo {
    width: 56px;
    height: 56px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .register {
    padding: var(--spacing-sm);
  }
  
  .register-form-card {
    padding: var(--spacing-md);
  }
  
  .register-title {
    font-size: var(--font-size-lg);
  }
  
  .register-input,
  .register-button {
    height: 48px;
  }
  
  .input-icon {
    font-size: 18px;
  }
  
  .register-logo {
    width: 48px;
    height: 48px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .password-strength {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .strength-bars {
    width: 100%;
  }
  
  .strength-text {
    align-self: flex-end;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .register::before {
    animation: none;
  }
  
  .register-header,
  .register-title,
  .register-subtitle,
  .register-form-card,
  .register-footer,
  .form-error,
  .password-strength {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .input-wrapper {
    border-width: 2px;
  }
  
  .register-button {
    border: 2px solid var(--accent-color);
  }
}

/* 自定义滚动条 */
.register-form-card::-webkit-scrollbar {
  width: 6px;
}

.register-form-card::-webkit-scrollbar-track {
  background: var(--border-light);
  border-radius: var(--border-radius-full);
}

.register-form-card::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: var(--border-radius-full);
  transition: background var(--transition-fast);
}

.register-form-card::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>