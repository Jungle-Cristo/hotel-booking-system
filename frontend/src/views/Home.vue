<template>
  <div class="home">
    <!-- 顶部轮播图 -->
    <div class="banner">
      <el-carousel :interval="5000" type="card" height="400px" indicator-position="outside">
        <el-carousel-item v-for="(item, index) in bannerList" :key="index">
          <div class="banner-item">
            <img :src="item.image" :alt="item.title" class="banner-img">
            <div class="banner-content">
              <h2 class="banner-title">{{ item.title }}</h2>
              <p class="banner-subtitle">{{ item.subtitle }}</p>
              <el-button type="primary" class="banner-btn" @click="goToHotelList">立即预订</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 搜索区 -->
    <div class="search-section">
      <div class="search-card">
        <h3 class="search-title">快速搜索</h3>
        <div class="search-form">
          <el-form :model="searchForm" class="search-form">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="目的地" required>
                  <el-input v-model="searchForm.destination" placeholder="请输入城市或酒店名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="入住日期" required>
                  <el-date-picker
                    v-model="searchForm.checkInDate"
                    type="date"
                    placeholder="选择入住日期"
                    :disabled-date="disabledDate"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="离店日期" required>
                  <el-date-picker
                    v-model="searchForm.checkOutDate"
                    type="date"
                    placeholder="选择离店日期"
                    :disabled-date="disabledCheckOutDate"
                    style="width: 100%"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="房间/人数">
                  <el-input v-model="searchForm.roomInfo" placeholder="1间房，2人" readonly @click="showRoomDialog = true"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="search-btn-container">
              <el-button type="primary" class="search-btn" @click="searchHotels">搜索酒店</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 优势特点 -->
    <div class="features">
      <h3 class="section-title">我们的优势</h3>
      <div class="feature-list">
        <div class="feature-item">
          <el-icon class="feature-icon"><House /></el-icon>
          <h4 class="feature-title">优质酒店</h4>
          <p class="feature-desc">精选全国优质酒店，满足不同需求</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Ticket /></el-icon>
          <h4 class="feature-title">优惠价格</h4>
          <p class="feature-desc">价格透明，享受更多优惠</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Clock /></el-icon>
          <h4 class="feature-title">便捷预订</h4>
          <p class="feature-desc">简单几步，快速完成预订</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Phone /></el-icon>
          <h4 class="feature-title">24小时客服</h4>
          <p class="feature-desc">随时为您提供帮助</p>
        </div>
      </div>
    </div>

    <!-- 推荐区 -->
    <div class="recommend-section">
      <h3 class="section-title">推荐酒店</h3>
      <el-tabs v-model="activeTab" class="recommend-tabs">
        <el-tab-pane label="热门酒店" name="hot"></el-tab-pane>
        <el-tab-pane label="特价房" name="discount"></el-tab-pane>
        <el-tab-pane label="高分酒店" name="high-rated"></el-tab-pane>
      </el-tabs>
      <div class="hotel-list">
        <div v-for="hotel in recommendHotels" :key="hotel.id" class="hotel-card">
          <img :src="hotel.imageUrl" :alt="hotel.name" class="hotel-card-img">
          <div class="hotel-card-body">
            <h4 class="hotel-card-title">{{ hotel.name }}</h4>
            <div class="hotel-card-rating">
              <el-rate v-model="hotel.starRating" disabled show-score score-template="{value}"></el-rate>
            </div>
            <div class="hotel-card-distance">{{ hotel.distance }}公里</div>
            <div class="hotel-card-price">
              ¥{{ hotel.price }}<span>/晚</span>
            </div>
            <el-button type="primary" class="book-btn" @click="goToHotelDetail(hotel.id)">立即预订</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间选择弹窗 -->
    <el-dialog v-model="showRoomDialog" title="选择房间和人数" width="400px">
      <el-form :model="roomForm">
        <el-form-item label="房间数">
          <el-input-number v-model="roomForm.roomCount" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="人数">
          <el-input-number v-model="roomForm.guestCount" :min="1" :max="20"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoomDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmRoomSelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { House, Ticket, Clock, Phone } from '@element-plus/icons-vue'

const router = useRouter()

// 轮播图数据
const bannerList = ref([
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20with%20swimming%20pool%20and%20beautiful%20landscape&image_size=landscape_16_9',
    title: '豪华度假酒店',
    subtitle: '享受奢华体验，留下美好回忆'
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20hotel%20interior%20with%20modern%20design&image_size=landscape_16_9',
    title: '商务精品酒店',
    subtitle: '便捷商务出行，舒适住宿体验'
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=family%20friendly%20hotel%20with%20playground&image_size=landscape_16_9',
    title: '亲子度假酒店',
    subtitle: '家庭出游首选，欢乐时光无限'
  }
])

// 搜索表单
const searchForm = ref({
  destination: '',
  checkInDate: '',
  checkOutDate: '',
  roomInfo: '1间房，2人'
})

// 房间选择
const showRoomDialog = ref(false)
const roomForm = ref({
  roomCount: 1,
  guestCount: 2
})

// 推荐酒店数据
const recommendHotels = ref([
  {
    id: 1,
    name: '北京希尔顿酒店',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20building&image_size=landscape_16_9',
    starRating: 5,
    distance: 2.5,
    price: 888
  },
  {
    id: 2,
    name: '上海外滩华尔道夫酒店',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20with%20river%20view&image_size=landscape_16_9',
    starRating: 5,
    distance: 1.8,
    price: 1288
  },
  {
    id: 3,
    name: '广州四季酒店',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20hotel%20building&image_size=landscape_16_9',
    starRating: 5,
    distance: 3.1,
    price: 988
  },
  {
    id: 4,
    name: '深圳湾万丽酒店',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20hotel%20exterior%20with%20city%20view&image_size=landscape_16_9',
    starRating: 4.8,
    distance: 2.2,
    price: 788
  }
])

// 标签页
const activeTab = ref('hot')

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 禁用早于入住日期的离店日期
const disabledCheckOutDate = (time) => {
  if (!searchForm.value.checkInDate) {
    return time.getTime() < Date.now() - 8.64e7
  }
  return time.getTime() < searchForm.value.checkInDate.getTime()
}

// 确认房间选择
const confirmRoomSelection = () => {
  searchForm.value.roomInfo = `${roomForm.value.roomCount}间房，${roomForm.value.guestCount}人`
  showRoomDialog.value = false
}

// 搜索酒店
const searchHotels = () => {
  // 这里应该调用真实的搜索 API，现在直接跳转到酒店列表页
  router.push('/hotels')
}

// 跳转到酒店列表
const goToHotelList = () => {
  router.push('/hotels')
}

// 跳转到酒店详情
const goToHotelDetail = (hotelId) => {
  // 这里应该导航到房间列表或预订页面，现在暂时导航到预订页面
  // 实际应用中，应该先显示酒店的房间列表，然后再选择房间进行预订
  router.push(`/booking/${hotelId}`)
}
</script>

<style scoped>
.home {
  width: 100%;
}

/* 轮播图样式 */
.banner {
  margin-bottom: var(--spacing-xl);
}

.banner-item {
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.banner-item:hover .banner-img {
  transform: scale(1.05);
}

.banner-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-xl);
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3));
  color: white;
}

.banner-title {
  font-size: var(--font-size-xxl);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-lg);
}

.banner-subtitle {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
  opacity: 0.9;
}

.banner-btn {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-active));
  border: none;
  border-radius: var(--border-radius-md);
  padding: 10px 24px;
  font-size: var(--font-size-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.banner-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 搜索区样式 */
.search-section {
  margin-bottom: var(--spacing-xl);
}

.search-card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.search-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.search-form {
  width: 100%;
}

.search-btn-container {
  margin-top: var(--spacing-md);
  text-align: center;
}

.search-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-active));
  border: none;
  border-radius: var(--border-radius-md);
  padding: 12px 48px;
  font-size: var(--font-size-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.search-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 优势特点样式 */
.features {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  text-align: center;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.feature-item {
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.feature-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.feature-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-md);
}

/* 推荐区样式 */
.recommend-section {
  margin-bottom: var(--spacing-xl);
}

.recommend-tabs {
  margin-bottom: var(--spacing-lg);
}

.hotel-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.hotel-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  background-color: var(--card-bg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.hotel-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.hotel-card-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  transition: transform var(--transition-slow);
}

.hotel-card:hover .hotel-card-img {
  transform: scale(1.05);
}

.hotel-card-body {
  padding: var(--spacing-md);
}

.hotel-card-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.hotel-card-rating {
  margin-bottom: var(--spacing-xs);
}

.hotel-card-distance {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-sm);
}

.hotel-card-price {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
}

.hotel-card-price span {
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--text-secondary);
}

.book-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-active));
  border: none;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.book-btn:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .banner {
    margin-bottom: var(--spacing-lg);
  }
  
  .banner-content {
    padding: var(--spacing-lg);
  }
  
  .banner-title {
    font-size: var(--font-size-xl);
  }
  
  .banner-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .search-card {
    padding: var(--spacing-md);
  }
  
  .feature-list {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
  
  .hotel-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-md);
  }
  
  .hotel-card-img {
    height: 160px;
  }
}
</style>