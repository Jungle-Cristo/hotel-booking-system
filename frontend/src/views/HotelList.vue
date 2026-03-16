<template>
  <div class="hotel-list">
    <!-- 酒店类型导航 -->
    <div class="hotel-type-nav">
      <div 
        v-for="type in hotelTypes" 
        :key="type.value"
        class="type-nav-item"
        :class="{ 'active': searchForm.hotelType === type.value }"
        @click="selectHotelType(type.value)"
      >
        <span class="type-icon">{{ type.icon }}</span>
        <span class="type-name">{{ type.label }}</span>
      </div>
    </div>
    
    <div class="search-bar">
      <el-card shadow="hover">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="城市">
            <el-select v-model="searchForm.city" placeholder="选择城市">
              <el-option label="北京" value="北京"></el-option>
              <el-option label="上海" value="上海"></el-option>
              <el-option label="广州" value="广州"></el-option>
              <el-option label="深圳" value="深圳"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="酒店类型">
            <el-select v-model="searchForm.hotelType" placeholder="选择酒店类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="电竞酒店" value="esports"></el-option>
              <el-option label="商务酒店" value="business"></el-option>
              <el-option label="度假酒店" value="resort"></el-option>
              <el-option label="精品酒店" value="boutique"></el-option>
              <el-option label="主题酒店" value="themed"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="星级">
            <el-select v-model="searchForm.starRating" placeholder="选择星级">
              <el-option label="全部" value=""></el-option>
              <el-option label="5星" value="5"></el-option>
              <el-option label="4星" value="4"></el-option>
              <el-option label="3星" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="价格范围">
            <el-slider
              v-model="priceRange"
              range
              :min="0"
              :max="5000"
              :step="100"
              @change="handlePriceChange"
            ></el-slider>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchHotels">搜索</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="hotel-grid">
      <div v-for="hotel in hotels" :key="hotel.id" class="hotel-card" :class="`hotel-type-${hotel.type}`">
        <div class="hotel-type-badge" :class="`type-${hotel.type}`">
          <span class="type-icon">{{ getHotelTypeIcon(hotel.type) }}</span>
          <span class="type-name">{{ getHotelTypeLabel(hotel.type) }}</span>
        </div>
        <img :src="hotel.imageUrl" :alt="hotel.name" class="hotel-image">
        <div class="hotel-info">
          <h3>{{ hotel.name }}</h3>
          <div class="hotel-rating">
            <el-rate v-model="hotel.starRating" disabled show-score score-template="{value}"></el-rate>
          </div>
          <p class="hotel-address">{{ hotel.address }}</p>
          <p class="hotel-description">{{ hotel.description }}</p>
          <div class="hotel-features">
            <span v-for="(feature, index) in hotel.features" :key="index" class="feature-tag">{{ feature }}</span>
          </div>
          <el-button type="primary" @click="viewHotelRooms(hotel.id)">查看房间</el-button>
        </div>
      </div>
    </div>
    
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import hotelService from '../services/hotelService'

const router = useRouter()

// 酒店类型定义
const hotelTypes = ref([
  { label: '全部', value: '', icon: '🏨' },
  { label: '电竞酒店', value: 'esports', icon: '🎮' },
  { label: '商务酒店', value: 'business', icon: '💼' },
  { label: '度假酒店', value: 'resort', icon: '🏖️' },
  { label: '精品酒店', value: 'boutique', icon: '✨' },
  { label: '主题酒店', value: 'themed', icon: '🎭' }
])

const searchForm = ref({
  city: '',
  hotelType: '',
  starRating: '',
  minPrice: 0,
  maxPrice: 5000
})

const priceRange = ref([0, 5000])
const hotels = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handlePriceChange = (value) => {
  searchForm.value.minPrice = value[0]
  searchForm.value.maxPrice = value[1]
}

// 选择酒店类型
const selectHotelType = (type) => {
  searchForm.value.hotelType = type
  searchHotels()
}

// 获取酒店类型图标
const getHotelTypeIcon = (type) => {
  const hotelType = hotelTypes.value.find(t => t.value === type)
  return hotelType ? hotelType.icon : '🏨'
}

// 获取酒店类型标签
const getHotelTypeLabel = (type) => {
  const hotelType = hotelTypes.value.find(t => t.value === type)
  return hotelType ? hotelType.label : '酒店'
}

const searchHotels = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      city: searchForm.value.city,
      hotelType: searchForm.value.hotelType,
      starRating: searchForm.value.starRating,
      minPrice: searchForm.value.minPrice,
      maxPrice: searchForm.value.maxPrice
    }
    
    // 使用酒店服务获取酒店列表
    const response = await hotelService.getHotels(params)
    
    // 如果API返回的数据为空，使用模拟数据
    if (!response.data || response.data.length === 0) {
      // 模拟数据 - 包含不同类型的酒店
      const mockHotels = [
        {
          id: 1,
          name: '北京希尔顿酒店',
          address: '北京市朝阳区东三环北路',
          starRating: 5,
          type: 'business',
          description: '北京希尔顿酒店位于朝阳区中心地带，交通便利，设施齐全，是商务和休闲出行的理想选择。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20business%20hotel%20exterior&image_size=landscape_16_9',
          features: ['商务中心', '会议室', '免费WiFi', '健身中心']
        },
        {
          id: 2,
          name: '上海外滩华尔道夫酒店',
          address: '上海市黄浦区中山东一路',
          starRating: 5,
          type: 'boutique',
          description: '上海外滩华尔道夫酒店位于外滩核心区域，尽享黄浦江美景，奢华舒适。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20boutique%20hotel%20with%20river%20view&image_size=landscape_16_9',
          features: ['江景房', ' SPA', '米其林餐厅', '私人管家']
        },
        {
          id: 3,
          name: '广州长隆酒店',
          address: '广州市番禺区迎宾路',
          starRating: 5,
          type: 'resort',
          description: '广州长隆酒店位于长隆旅游度假区内，与长隆野生动物世界相邻，是亲子度假的理想选择。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tropical%20resort%20hotel%20with%20pool&image_size=landscape_16_9',
          features: ['主题公园', '游泳池', '儿童俱乐部', '动物互动']
        },
        {
          id: 4,
          name: '深圳福田香格里拉大酒店',
          address: '深圳市福田区益田路',
          starRating: 5,
          type: 'business',
          description: '深圳福田香格里拉大酒店位于福田中心区，靠近深圳会展中心，交通便利。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20hotel%20in%20city%20center&image_size=landscape_16_9',
          features: ['商务中心', '会议室', '行政酒廊', '健身中心']
        },
        {
          id: 5,
          name: '上海网鱼电竞酒店',
          address: '上海市静安区南京西路',
          starRating: 4,
          type: 'esports',
          description: '上海网鱼电竞酒店是一家专业的电竞主题酒店，配备高端 gaming 设备，为电竞爱好者提供沉浸式体验。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=esports%20hotel%20with%20gaming%20setup&image_size=landscape_16_9',
          features: ['高端电竞设备', '高速网络', '电竞主题房间', '24小时服务']
        },
        {
          id: 6,
          name: '北京环球影城主题酒店',
          address: '北京市通州区环球大道',
          starRating: 5,
          type: 'themed',
          description: '北京环球影城主题酒店以电影为主题，融入环球影城的元素，为游客提供独特的住宿体验。',
          imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=themed%20hotel%20with%20movie%20elements&image_size=landscape_16_9',
          features: ['主题房间', '优先入园', '电影元素', '特色餐饮']
        }
      ]
      
      // 保存模拟数据到本地存储
      mockHotels.forEach(hotel => {
        hotelService.addHotel(hotel)
      })
      
      hotels.value = mockHotels
      total.value = mockHotels.length
    } else {
      hotels.value = response.data
      total.value = response.total
    }
    
    // 根据酒店类型筛选
    if (searchForm.value.hotelType) {
      hotels.value = hotels.value.filter(hotel => hotel.type === searchForm.value.hotelType)
      total.value = hotels.value.length
    }
  } catch (error) {
    console.error('搜索酒店失败:', error)
  }
}

const resetForm = () => {
  searchForm.value = {
    city: '',
    hotelType: '',
    starRating: '',
    minPrice: 0,
    maxPrice: 5000
  }
  priceRange.value = [0, 5000]
  currentPage.value = 1
  searchHotels()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  searchHotels()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  searchHotels()
}

const viewHotelRooms = (hotelId) => {
  // 导航到酒店详情页面，用户可以在那里查看酒店信息并选择房间
  router.push(`/hotel/${hotelId}`)
}

onMounted(() => {
  searchHotels()
})
</script>

<style scoped>
.hotel-list {
  padding: 20px;
}

/* 酒店类型导航 */
.hotel-type-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding: 12px 0;
}

.type-nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f6f8fa;
  border: 1px solid #eaecef;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.type-nav-item:hover {
  background-color: #eaecef;
  border-color: #0969da;
}

.type-nav-item.active {
  background-color: #0969da;
  color: white;
  border-color: #0969da;
}

.type-icon {
  font-size: 16px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
}

.search-bar {
  margin-bottom: 30px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.hotel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.hotel-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  position: relative;
}

.hotel-card:hover {
  transform: translateY(-5px);
}

/* 酒店类型徽章 */
.hotel-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 不同类型酒店的徽章样式 */
.hotel-type-badge.type-esports {
  background-color: #7289da;
  color: white;
}

.hotel-type-badge.type-business {
  background-color: #2c3e50;
  color: white;
}

.hotel-type-badge.type-resort {
  background-color: #27ae60;
  color: white;
}

.hotel-type-badge.type-boutique {
  background-color: #9b59b6;
  color: white;
}

.hotel-type-badge.type-themed {
  background-color: #e67e22;
  color: white;
}

/* 不同类型酒店的卡片样式 */
.hotel-card.hotel-type-esports:hover {
  box-shadow: 0 4px 16px rgba(114, 137, 218, 0.3);
}

.hotel-card.hotel-type-business:hover {
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.3);
}

.hotel-card.hotel-type-resort:hover {
  box-shadow: 0 4px 16px rgba(39, 174, 96, 0.3);
}

.hotel-card.hotel-type-boutique:hover {
  box-shadow: 0 4px 16px rgba(155, 89, 182, 0.3);
}

.hotel-card.hotel-type-themed:hover {
  box-shadow: 0 4px 16px rgba(230, 126, 34, 0.3);
}

.hotel-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hotel-card:hover .hotel-image {
  transform: scale(1.05);
}

.hotel-info {
  padding: 15px;
}

.hotel-info h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.hotel-rating {
  margin-bottom: 10px;
}

.hotel-address {
  margin-bottom: 10px;
  color: #666;
  font-size: 14px;
}

.hotel-description {
  margin-bottom: 15px;
  color: #999;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 酒店特色标签 */
.hotel-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.feature-tag {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f6f8fa;
  color: #57606a;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #eaecef;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hotel-type-nav {
    gap: 8px;
  }
  
  .type-nav-item {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .hotel-grid {
    grid-template-columns: 1fr;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .hotel-type-badge {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>