<template>
  <div class="hotel-detail">
    <div v-if="loading" class="loading-container">
      <el-spinner type="line" size="large"></el-spinner>
      <p>加载酒店信息中...</p>
    </div>
    <div v-else>
      <div class="hotel-header" :class="`hotel-type-${hotel.type}`">
        <div class="hotel-type-badge" :class="`type-${hotel.type}`">
          <span class="type-icon">{{ getHotelTypeIcon(hotel.type) }}</span>
          <span class="type-name">{{ getHotelTypeLabel(hotel.type) }}</span>
        </div>
        <h1 class="hotel-name">{{ hotel.name }}</h1>
        <div class="hotel-rating">
          <el-rate v-model="hotel.starRating" disabled show-score score-template="{value}"></el-rate>
          <span v-if="hotel.rating" class="rating-text">{{ hotel.rating }} ({{ hotel.reviewCount || 0 }}条评论)</span>
        </div>
        <p class="hotel-address">{{ hotel.address }}</p>
        <div v-if="hotel.lastUpdated" class="last-updated">
          最后更新: {{ formatDate(hotel.lastUpdated) }}
        </div>
      </div>
      
      <div class="hotel-content">
        <div class="hotel-images">
          <div class="main-image">
            <img :src="hotel.imageUrl" :alt="hotel.name">
          </div>
          <div class="image-gallery">
            <img 
              v-for="(image, index) in hotel.gallery" 
              :key="index"
              :src="image" 
              :alt="`${hotel.name} 图片 ${index + 1}`"
              class="gallery-image"
            >
          </div>
        </div>
        
        <div class="hotel-info-section">
          <h2>酒店介绍</h2>
          <p class="hotel-description">{{ hotel.description }}</p>
          
          <h2>特色服务</h2>
          <div class="hotel-features">
            <div 
              v-for="(feature, index) in hotel.features" 
              :key="index"
              class="feature-item"
            >
              <span class="feature-icon">{{ feature.icon || '⭐' }}</span>
              <span class="feature-name">{{ feature.name }}</span>
              <span class="feature-desc">{{ feature.description }}</span>
            </div>
          </div>
          
          <h2>设施与服务</h2>
          <div class="hotel-amenities">
            <div 
              v-for="(amenity, index) in hotel.amenities" 
              :key="index"
              class="amenity-item"
            >
              <span class="amenity-icon">{{ amenity.icon || '✅' }}</span>
              <span class="amenity-name">{{ amenity.name }}</span>
            </div>
          </div>
          
          <h2>客房类型</h2>
          <div class="room-types">
            <div 
              v-for="(room, index) in hotel.rooms" 
              :key="index"
              class="room-card"
            >
              <img :src="room.imageUrl" :alt="room.type" class="room-image">
              <div class="room-info">
                <h3>{{ room.type }}</h3>
                <p class="room-description">{{ room.description }}</p>
                <div class="room-price">
                  <span class="price">{{ room.price }}元/晚</span>
                  <el-button type="primary" @click="bookRoom(room.id)">立即预订</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 新增评论部分 -->
          <h2 v-if="hotel.reviews && hotel.reviews.length > 0">用户评论</h2>
          <div v-if="hotel.reviews && hotel.reviews.length > 0" class="hotel-reviews">
            <div 
              v-for="(review, index) in hotel.reviews" 
              :key="index"
              class="review-item"
            >
              <div class="review-header">
                <span class="review-user">{{ review.userName }}</span>
                <el-rate v-model="review.rating" disabled :max="5" show-score score-template="{value}"></el-rate>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-text">{{ review.text }}</p>
            </div>
          </div>
          
          <!-- 新增周边环境部分 -->
          <h2 v-if="hotel.surroundings && hotel.surroundings.length > 0">周边环境</h2>
          <div v-if="hotel.surroundings && hotel.surroundings.length > 0" class="hotel-surroundings">
            <div 
              v-for="(item, index) in hotel.surroundings" 
              :key="index"
              class="surrounding-item"
            >
              <span class="surrounding-name">{{ item.name }}</span>
              <span class="surrounding-distance">{{ item.distance }}</span>
              <p class="surrounding-description">{{ item.description }}</p>
            </div>
          </div>
          
          <!-- 新增政策部分 -->
          <h2 v-if="hotel.policies">酒店政策</h2>
          <div v-if="hotel.policies" class="hotel-policies">
            <div class="policy-item">
              <span class="policy-label">入住时间:</span>
              <span class="policy-value">{{ hotel.policies.checkInTime }}</span>
            </div>
            <div class="policy-item">
              <span class="policy-label">退房时间:</span>
              <span class="policy-value">{{ hotel.policies.checkOutTime }}</span>
            </div>
            <div class="policy-item">
              <span class="policy-label">取消政策:</span>
              <span class="policy-value">{{ hotel.policies.cancellationPolicy }}</span>
            </div>
            <div class="policy-item">
              <span class="policy-label">支付方式:</span>
              <span class="policy-value">{{ hotel.policies.paymentMethods?.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import hotelService from '../services/hotelService'

const router = useRouter()
const route = useRoute()
const hotelId = route.params.id

// 加载状态
const loading = ref(true)

// 酒店类型定义
const hotelTypes = [
  { label: '全部', value: '', icon: '🏨' },
  { label: '电竞酒店', value: 'esports', icon: '🎮' },
  { label: '商务酒店', value: 'business', icon: '�' },
  { label: '度假酒店', value: 'resort', icon: '🏖️' },
  { label: '精品酒店', value: 'boutique', icon: '✨' },
  { label: '主题酒店', value: 'themed', icon: '🎭' }
]

// 酒店数据
const hotel = ref({
  id: hotelId,
  name: '加载中...',
  address: '',
  starRating: 3,
  type: 'business',
  description: '',
  imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20exterior&image_size=landscape_16_9',
  gallery: [],
  features: [],
  amenities: [],
  rooms: [],
  reviews: [],
  surroundings: [],
  policies: {}
})

// 获取酒店类型图标
const getHotelTypeIcon = (type) => {
  const hotelType = hotelTypes.find(t => t.value === type)
  return hotelType ? hotelType.icon : '🏨'
}

// 获取酒店类型标签
const getHotelTypeLabel = (type) => {
  const hotelType = hotelTypes.find(t => t.value === type)
  return hotelType ? hotelType.label : '酒店'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 预订房间
const bookRoom = (roomId) => {
  // 确保房间ID包含酒店ID信息
  const fullRoomId = `${hotelId}-${roomId}`
  router.push(`/booking/${fullRoomId}`)
}

// 加载酒店详情
const loadHotelDetail = async () => {
  try {
    loading.value = true
    
    // 首先从酒店服务获取酒店详情
    const response = await hotelService.getHotelDetail(hotelId)
    let hotelData = response.data
    
    // 检查酒店数据是否完整
    const isDataComplete = hotelService.checkHotelDataCompleteness(hotelId)
    
    if (!isDataComplete) {
      // 修复酒店数据完整性
      console.log('酒店数据不完整，开始修复...')
      await hotelService.fixHotelDataCompleteness(hotelId)
      
      // 重新获取修复后的酒店详情
      const updatedResponse = await hotelService.getHotelDetail(hotelId)
      hotelData = updatedResponse.data
      console.log('酒店信息已修复')
    }
    
    // 设置酒店数据
    hotel.value = hotelData
  } catch (error) {
    console.error('加载酒店详情失败:', error)
    
    // 如果获取失败，使用默认数据
    hotel.value = {
      id: hotelId,
      name: `酒店 ${hotelId}`,
      address: '未知地址',
      starRating: 3,
      type: 'business',
      description: '暂无酒店描述',
      imageUrl: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20exterior%20${hotelId}&image_size=landscape_16_9`,
      gallery: [],
      features: [],
      amenities: [],
      rooms: [],
      reviews: [],
      surroundings: [],
      policies: {
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: '入住前24小时可免费取消',
        paymentMethods: ['信用卡', '支付宝', '微信支付', '现金']
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHotelDetail()
})
</script>

<style scoped>
.hotel-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

/* 酒店头部 */
.hotel-header {
  background-color: #f6f8fa;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

/* 不同类型酒店的头部样式 */
.hotel-header.hotel-type-esports {
  background: linear-gradient(135deg, #7289da, #5b6eae);
  color: white;
}

.hotel-header.hotel-type-business {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
}

.hotel-header.hotel-type-resort {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.hotel-header.hotel-type-boutique {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.hotel-header.hotel-type-themed {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.hotel-name {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
}

.hotel-rating {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-size: 16px;
  font-weight: 500;
}

.hotel-address {
  font-size: 16px;
  margin: 0 0 12px 0;
}

.last-updated {
  font-size: 14px;
  opacity: 0.8;
}

/* 酒店类型徽章 */
.hotel-type-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* 酒店内容 */
.hotel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* 酒店图片 */
.hotel-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.05);
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.gallery-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-image:hover {
  transform: scale(1.05);
}

/* 酒店信息 section */
.hotel-info-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.hotel-info-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaecef;
}

.hotel-description {
  font-size: 16px;
  line-height: 1.5;
  color: #57606a;
  margin: 0;
}

/* 酒店特色 */
.hotel-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-item:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-name {
  font-size: 16px;
  font-weight: 500;
  color: #24292e;
  flex-shrink: 0;
}

.feature-desc {
  font-size: 14px;
  color: #57606a;
  flex: 1;
}

/* 酒店设施 */
.hotel-amenities {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.amenity-item:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

.amenity-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.amenity-name {
  font-size: 14px;
  color: #57606a;
}

/* 客房类型 */
.room-types {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.room-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.room-card:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-image {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.room-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin: 0 0 8px 0;
}

.room-description {
  font-size: 14px;
  color: #57606a;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.room-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-price .price {
  font-size: 18px;
  font-weight: 600;
  color: #0969da;
}

/* 酒店评论 */
.hotel-reviews {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.review-item:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.review-user {
  font-weight: 500;
  color: #24292e;
}

.review-date {
  font-size: 14px;
  color: #6a737d;
  margin-left: auto;
}

.review-text {
  font-size: 14px;
  line-height: 1.5;
  color: #57606a;
  margin: 0;
}

/* 周边环境 */
.hotel-surroundings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.surrounding-item {
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.surrounding-item:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

.surrounding-name {
  font-weight: 500;
  color: #24292e;
  margin-right: 12px;
}

.surrounding-distance {
  font-size: 14px;
  color: #0969da;
  font-weight: 500;
  margin-right: 12px;
}

.surrounding-description {
  font-size: 14px;
  color: #57606a;
  margin: 8px 0 0 0;
  line-height: 1.4;
}

/* 酒店政策 */
.hotel-policies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-item {
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.policy-item:hover {
  background-color: #eaecef;
  transform: translateY(-2px);
}

.policy-label {
  font-weight: 500;
  color: #24292e;
  margin-right: 12px;
}

.policy-value {
  color: #57606a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hotel-detail {
    padding: 16px;
  }
  
  .hotel-header {
    padding: 24px;
  }
  
  .hotel-name {
    font-size: 24px;
  }
  
  .hotel-content {
    grid-template-columns: 1fr;
  }
  
  .main-image img {
    height: 300px;
  }
  
  .image-gallery {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .gallery-image {
    height: 100px;
  }
  
  .hotel-amenities {
    grid-template-columns: 1fr;
  }
  
  .room-card {
    flex-direction: column;
  }
  
  .room-image {
    width: 100%;
    height: 200px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .review-date {
    margin-left: 0;
  }
}
</style>
