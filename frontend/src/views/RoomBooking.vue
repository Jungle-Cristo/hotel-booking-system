<template>
  <div class="room-booking">
    <div v-if="loading" class="loading-container">
      <el-spinner type="line" size="large"></el-spinner>
      <p>加载房间信息中...</p>
    </div>
    <el-card v-else shadow="hover">
      <template #header>
        <div class="card-header">
          <span>房间预订</span>
        </div>
      </template>
      
      <div class="hotel-info-section">
        <div class="hotel-info">
          <h3>{{ bookingForm.hotelName }}</h3>
          <p class="hotel-address" v-if="hotelAddress">{{ hotelAddress }}</p>
        </div>
      </div>
      
      <el-form :model="bookingForm" :rules="rules" ref="bookingFormRef" label-width="100px">
        <el-form-item label="酒店名称" prop="hotelName">
          <el-input v-model="bookingForm.hotelName" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="房间类型" prop="roomType">
          <el-input v-model="bookingForm.roomType" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="房间价格" prop="price">
          <el-input v-model="bookingForm.price" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="入住时间" prop="checkInTime">
          <el-date-picker
            v-model="bookingForm.checkInTime"
            type="datetime"
            placeholder="选择入住时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="退房时间" prop="checkOutTime">
          <el-date-picker
            v-model="bookingForm.checkOutTime"
            type="datetime"
            placeholder="选择退房时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            :disabled-time="disabledCheckOutTime"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="bookingForm.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        
        <el-form-item label="预订人" prop="userName">
          <el-input v-model="bookingForm.userName" placeholder="请输入预订人姓名"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitBooking">提交预订</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { bookingApi } from '../api'
import hotelService from '../services/hotelService'

const router = useRouter()
const route = useRoute()
const roomId = route.params.roomId

// 加载状态
const loading = ref(true)

// 酒店地址
const hotelAddress = ref('')

const bookingFormRef = ref()
const bookingForm = ref({
  hotelName: '加载中...',
  roomType: '',
  price: '',
  checkInTime: '',
  checkOutTime: '',
  contactPhone: '',
  userName: ''
})

const rules = {
  checkInTime: [{ required: true, message: '请选择入住时间', trigger: 'change' }],
  checkOutTime: [{ required: true, message: '请选择退房时间', trigger: 'change' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入预订人姓名', trigger: 'blur' }]
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const disabledCheckOutTime = (date) => {
  if (!bookingForm.value.checkInTime) {
    return { start: '00:00', end: '23:59' }
  }
  const checkInDate = new Date(bookingForm.value.checkInTime)
  if (date.getDate() === checkInDate.getDate()) {
    const checkInHour = checkInDate.getHours()
    const checkInMinute = checkInDate.getMinutes()
    return { start: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`, end: '23:59' }
  }
  return { start: '00:00', end: '23:59' }
}

const loadRoomInfo = async () => {
  try {
    loading.value = true
    
    // 从房间ID中提取酒店ID（格式为酒店ID-房间ID）
    const parts = roomId.split('-')
    const hotelId = parts[0] || '1'
    const roomNumber = parts[1] || '1'
    
    // 获取酒店详情
    const hotelResponse = await hotelService.getHotelDetail(hotelId)
    const hotelData = hotelResponse.data
    
    // 保存酒店地址
    hotelAddress.value = hotelData.address || ''
    
    // 根据房间ID查找对应的房间
    let room
    if (hotelData.rooms) {
      // 尝试通过ID匹配
      room = hotelData.rooms.find(r => r.id.toString() === roomId || r.id.toString() === roomNumber)
    }
    
    // 如果没有找到房间，使用模拟数据
    if (!room) {
      room = {
        id: roomId,
        hotelId: hotelId,
        hotelName: hotelData.name || `酒店 ${hotelId}`,
        roomType: '豪华大床房',
        price: '1280.00',
        description: '豪华大床房，配备舒适的大床，独立卫浴，高速WiFi，迷你吧等设施。',
        imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20room%20${hotelId}&image_size=landscape_16_9`
      }
    }
    
    bookingForm.value.hotelName = room.hotelName
    bookingForm.value.roomType = room.roomType
    bookingForm.value.price = room.price
  } catch (error) {
    console.error('加载房间信息失败:', error)
    
    // 如果获取失败，使用默认数据
    bookingForm.value.hotelName = '未知酒店'
    bookingForm.value.roomType = '标准间'
    bookingForm.value.price = '0.00'
  } finally {
    loading.value = false
  }
}

const submitBooking = async () => {
  try {
    await bookingFormRef.value.validate()
    
    // 从房间ID中提取酒店ID
    const hotelId = roomId.split('-')[0] || '1'
    
    const bookingData = {
      userId: 1, // 这里应该从登录状态获取
      hotelId: hotelId,
      roomId: roomId,
      checkInTime: bookingForm.value.checkInTime,
      checkOutTime: bookingForm.value.checkOutTime,
      contactPhone: bookingForm.value.contactPhone,
      userName: bookingForm.value.userName
    }
    
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await bookingApi.createBooking(bookingData)
    // router.push(`/booking/confirm/${response.bookingId}`)
    
    // 模拟成功
    router.push(`/booking/confirm/1`)
  } catch (error) {
    console.error('提交预订失败:', error)
  }
}

const resetForm = () => {
  bookingFormRef.value.resetFields()
}

onMounted(() => {
  loadRoomInfo()
})
</script>

<style scoped>
.room-booking {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 20px;
}

/* 酒店信息部分 */
.hotel-info-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 8px;
}

.hotel-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
}

.hotel-address {
  margin: 0;
  font-size: 14px;
  color: #57606a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-booking {
    padding: 16px;
  }
  
  .hotel-info-section {
    padding: 12px;
  }
  
  .hotel-info h3 {
    font-size: 16px;
  }
}
</style>