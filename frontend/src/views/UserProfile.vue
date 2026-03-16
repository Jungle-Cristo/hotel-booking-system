<template>
  <div class="user-profile">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>
      
      <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="updateProfile">更新资料</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useUserStore from '../store/user'
import { userApi } from '../api'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const userFormRef = ref()
const userForm = ref({
  username: '',
  name: '',
  phone: '',
  email: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
}

const loadUserInfo = async () => {
  try {
    const userInfo = userStore.userInfo
    if (userInfo) {
      userForm.value = {
        username: userInfo.username,
        name: userInfo.name || '',
        phone: userInfo.phone || '',
        email: userInfo.email || ''
      }
    } else {
      // 这里应该调用真实的 API，现在使用模拟数据
      // const response = await userApi.getUserInfo(1)
      // userForm.value = response.data
      
      // 模拟数据
      userForm.value = {
        username: 'test',
        name: '测试用户',
        phone: '13812345678',
        email: 'test@example.com'
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const updateProfile = async () => {
  try {
    await userFormRef.value.validate()
    
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await userApi.updateUserInfo(1, userForm.value)
    
    // 模拟更新成功
    userStore.login({
      id: 1,
      ...userForm.value
    }, userStore.token)
    
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新资料失败:', error)
  }
}

const resetForm = () => {
  userFormRef.value.resetFields()
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>