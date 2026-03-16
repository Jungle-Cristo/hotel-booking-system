<template>
  <div class="booking-confirm">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>预订确认</span>
        </div>
      </template>
      
      <div v-if="bookingInfo" class="booking-info">
        <el-alert
          :title="'订单号: ' + bookingInfo.orderNo"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        ></el-alert>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <h3>预订信息</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="酒店名称">{{ bookingInfo.hotelName }}</el-descriptions-item>
              <el-descriptions-item label="房间类型">{{ bookingInfo.roomType }}</el-descriptions-item>
              <el-descriptions-item label="入住时间">{{ bookingInfo.checkInTime }}</el-descriptions-item>
              <el-descriptions-item label="退房时间">{{ bookingInfo.checkOutTime }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ bookingInfo.contactPhone }}</el-descriptions-item>
              <el-descriptions-item label="总价格"><span class="price">{{ bookingInfo.totalPrice }}</span></el-descriptions-item>
              <el-descriptions-item label="订单状态"><el-tag :type="getStatusType(bookingInfo.status)">{{ bookingInfo.status }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="过期时间" v-if="bookingInfo.status === 'PENDING'">
                <span class="expire-time">{{ bookingInfo.expireTime }}</span>
                <el-progress :percentage="expireProgress" :format="formatProgress"></el-progress>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
          
          <el-col :span="12">
            <h3>支付方式</h3>
            <el-radio-group v-model="paymentMethod">
              <el-radio-button label="alipay">支付宝</el-radio-button>
              <el-radio-button label="wechat">微信支付</el-radio-button>
              <el-radio-button label="card">银行卡</el-radio-button>
            </el-radio-group>
            
            <div class="payment-info" style="margin-top: 20px">
              <h4>支付金额: <span class="price">{{ bookingInfo.totalPrice }}</span></h4>
              <p class="payment-note">请在过期时间前完成支付，否则订单将自动取消</p>
            </div>
            
            <div class="action-buttons" style="margin-top: 30px">
              <el-button type="primary" size="large" @click="submitPayment" v-if="bookingInfo.status === 'PENDING'">立即支付</el-button>
              <el-button type="danger" @click="cancelBooking" v-if="bookingInfo.status === 'PENDING'">取消预订</el-button>
              <el-button @click="goToMyBookings">查看我的预订</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div v-else class="loading">
        <el-loading v-model="loading" element-loading-text="加载中..."></el-loading>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { bookingApi, paymentApi } from '../api'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const bookingId = route.params.bookingId

const loading = ref(true)
const bookingInfo = ref(null)
const paymentMethod = ref('alipay')
const expireProgress = ref(100)
const timer = ref(null)

const getStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'PAID': return 'success'
    case 'CANCELLED': return 'danger'
    case 'COMPLETED': return 'info'
    default: return 'info'
  }
}

const formatProgress = () => {
  return `${expireProgress.value}%`
}

const loadBookingInfo = async () => {
  try {
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await bookingApi.getBookingDetail(bookingId)
    // bookingInfo.value = response.data
    
    // 模拟数据
    bookingInfo.value = {
      id: bookingId,
      orderNo: 'ORD20260313123456',
      hotelName: '北京希尔顿酒店',
      roomType: '豪华大床房',
      checkInTime: '2026-03-14 14:00',
      checkOutTime: '2026-03-16 12:00',
      contactPhone: '13812345678',
      totalPrice: '2560.00',
      status: 'PENDING',
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toLocaleString()
    }
    
    // 计算过期时间进度
    startExpireTimer()
  } catch (error) {
    console.error('加载预订信息失败:', error)
  } finally {
    loading.value = false
  }
}

const startExpireTimer = () => {
  const expireTime = new Date(bookingInfo.value.expireTime).getTime()
  const startTime = Date.now()
  const totalTime = expireTime - startTime
  
  timer.value = setInterval(() => {
    const currentTime = Date.now()
    const remainingTime = expireTime - currentTime
    if (remainingTime <= 0) {
      clearInterval(timer.value)
      expireProgress.value = 0
      // 这里应该调用 API 检查订单状态
    } else {
      expireProgress.value = Math.round((remainingTime / totalTime) * 100)
    }
  }, 1000)
}

const submitPayment = async () => {
  try {
    const paymentData = {
      bookingId: bookingId,
      amount: bookingInfo.value.totalPrice,
      paymentMethod: paymentMethod.value
    }
    
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await paymentApi.createPayment(paymentData)
    // 跳转到支付页面或显示支付二维码
    
    // 模拟支付成功
    ElMessageBox.alert('支付成功！', '提示', {
      confirmButtonText: '确定',
      callback: () => {
        router.push('/bookings')
      }
    })
  } catch (error) {
    console.error('提交支付失败:', error)
  }
}

const cancelBooking = async () => {
  try {
    // 这里应该调用真实的 API，现在使用模拟数据
    // await bookingApi.cancelBooking(bookingId)
    
    // 模拟取消成功
    ElMessageBox.confirm('确定要取消预订吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/bookings')
    })
  } catch (error) {
    console.error('取消预订失败:', error)
  }
}

const goToMyBookings = () => {
  router.push('/bookings')
}

onMounted(() => {
  loadBookingInfo()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.booking-confirm {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.booking-info {
  padding: 20px 0;
}

.price {
  font-size: 24px;
  color: #ff4d4f;
  font-weight: bold;
}

.expire-time {
  color: #ff4d4f;
  font-weight: bold;
}

.payment-note {
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.loading {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>