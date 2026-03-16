// 网络爬虫服务 - 模拟从外部数据源获取酒店信息
class ScraperService {
  constructor() {
    this.baseUrl = 'https://api.example.com/hotel-scraper' // 模拟爬虫API地址
  }

  // 爬取酒店详情
  async scrapeHotelDetail(hotelId, hotelName) {
    try {
      // 模拟网络请求延迟
      await this.delay(1000)
      
      // 模拟爬取结果
      const scrapedData = this.generateMockScrapedData(hotelId, hotelName)
      
      console.log(`成功爬取酒店 ${hotelName} 的详细信息`)
      return scrapedData
    } catch (error) {
      console.error('爬取酒店详情失败:', error)
      throw error
    }
  }

  // 爬取酒店评论
  async scrapeHotelReviews(hotelId) {
    try {
      // 模拟网络请求延迟
      await this.delay(800)
      
      // 模拟评论数据
      const reviews = this.generateMockReviews()
      
      console.log(`成功爬取酒店 ${hotelId} 的评论信息`)
      return reviews
    } catch (error) {
      console.error('爬取酒店评论失败:', error)
      throw error
    }
  }

  // 爬取酒店周边环境
  async scrapeHotelSurroundings(hotelId, address) {
    try {
      // 模拟网络请求延迟
      await this.delay(1200)
      
      // 模拟周边环境数据
      const surroundings = this.generateMockSurroundings(address)
      
      console.log(`成功爬取酒店 ${hotelId} 的周边环境信息`)
      return surroundings
    } catch (error) {
      console.error('爬取酒店周边环境失败:', error)
      throw error
    }
  }

  // 批量爬取酒店信息
  async batchScrapeHotels(hotelIds) {
    const results = []
    
    for (const hotelId of hotelIds) {
      try {
        // 模拟网络请求延迟
        await this.delay(500)
        
        // 模拟爬取结果
        const scrapedData = this.generateMockScrapedData(hotelId, `酒店 ${hotelId}`)
        results.push(scrapedData)
      } catch (error) {
        console.error(`爬取酒店 ${hotelId} 失败:`, error)
        results.push(null)
      }
    }
    
    return results
  }

  // 针对缺失信息进行定向爬取
  async scrapeMissingInfo(hotelId, hotelData, missingFields) {
    try {
      console.log(`针对酒店 ${hotelId} 的缺失信息进行定向爬取:`, missingFields)
      
      const result = {}
      
      // 根据缺失字段进行定向爬取
      if (missingFields.includes('description')) {
        await this.delay(500)
        result.description = this.generateMockDescription(hotelData.name)
      }
      
      if (missingFields.includes('amenities') || missingFields.includes('facilities')) {
        await this.delay(600)
        result.facilities = this.generateMockFacilities()
      }
      
      if (missingFields.includes('features') || missingFields.includes('services')) {
        await this.delay(600)
        result.services = this.generateMockServices()
      }
      
      if (missingFields.includes('gallery') || missingFields.includes('images')) {
        await this.delay(700)
        result.images = this.generateMockImages(hotelId)
      }
      
      if (missingFields.includes('reviews')) {
        await this.delay(800)
        result.reviews = this.generateMockReviews()
      }
      
      if (missingFields.includes('surroundings')) {
        await this.delay(900)
        result.surroundings = this.generateMockSurroundings(hotelData.address)
      }
      
      if (missingFields.includes('policies')) {
        await this.delay(500)
        result.policies = this.generateMockPolicies()
      }
      
      if (missingFields.includes('rating')) {
        await this.delay(400)
        result.rating = (4 + Math.random()).toFixed(1)
        result.reviewCount = Math.floor(Math.random() * 1000) + 100
      }
      
      console.log(`成功爬取酒店 ${hotelId} 的缺失信息`)
      return result
    } catch (error) {
      console.error('定向爬取缺失信息失败:', error)
      throw error
    }
  }

  // 生成模拟的爬取数据
  generateMockScrapedData(hotelId, hotelName) {
    return {
      id: hotelId,
      name: hotelName,
      description: this.generateMockDescription(hotelName),
      facilities: this.generateMockFacilities(),
      services: this.generateMockServices(),
      policies: this.generateMockPolicies(),
      images: this.generateMockImages(hotelId),
      rating: (4 + Math.random()).toFixed(1),
      reviewCount: Math.floor(Math.random() * 1000) + 100
    }
  }

  // 生成模拟描述
  generateMockDescription(hotelName) {
    const descriptions = [
      `这是 ${hotelName} 的详细描述。酒店设施齐全，服务周到，是您出行的理想选择。`,
      `${hotelName} 位于市中心，交通便利，周边配套齐全。酒店提供舒适的住宿环境和优质的服务。`,
      `欢迎来到 ${hotelName}，我们致力于为您提供难忘的住宿体验。酒店配备现代化设施，满足您的各种需求。`,
      `${hotelName} 是一家高品质酒店，拥有豪华客房和套房，提供全方位的服务和设施。`,
      `位于黄金地段的 ${hotelName}，是商务和休闲旅客的理想选择。我们的团队将竭诚为您服务。`
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  // 生成模拟设施
  generateMockFacilities() {
    const allFacilities = [
      { name: '免费WiFi', description: '覆盖全酒店的高速WiFi' },
      { name: '停车场', description: '免费停车场' },
      { name: '健身房', description: '24小时开放的健身中心' },
      { name: '游泳池', description: '室内恒温游泳池' },
      { name: '餐厅', description: '提供中西式美食' },
      { name: '商务中心', description: '提供复印、打印等商务服务' },
      { name: '会议室', description: '配备先进的会议设备' },
      { name: '24小时前台', description: '全天候服务' },
      { name: '行李寄存', description: '免费行李寄存服务' },
      { name: '洗衣服务', description: '专业的洗衣服务' },
      { name: '叫醒服务', description: '提供叫醒服务' },
      { name: '旅游咨询', description: '提供当地旅游信息' }
    ]
    
    // 随机选择8-12个设施
    const count = Math.floor(Math.random() * 5) + 8
    const shuffled = allFacilities.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // 生成模拟服务
  generateMockServices() {
    const allServices = [
      { name: '早餐服务', description: '提供丰富的自助早餐' },
      { name: '洗衣服务', description: '专业的洗衣服务' },
      { name: '叫车服务', description: '提供叫车服务' },
      { name: '行李寄存', description: '免费行李寄存' },
      { name: '旅游咨询', description: '提供当地旅游信息' },
      { name: '会议服务', description: '提供会议组织和支持' },
      { name: '商务服务', description: '提供商务中心和秘书服务' },
      { name: '接送服务', description: '提供机场接送服务' },
      { name: '客房服务', description: '24小时客房服务' },
      { name: 'SPA服务', description: '提供放松身心的SPA服务' }
    ]
    
    // 随机选择5-8个服务
    const count = Math.floor(Math.random() * 4) + 5
    const shuffled = allServices.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // 生成模拟政策
  generateMockPolicies() {
    const checkInTimes = ['14:00', '15:00', '16:00']
    const checkOutTimes = ['11:00', '12:00', '13:00']
    const cancellationPolicies = [
      '入住前24小时可免费取消',
      '入住前48小时可免费取消',
      '入住前7天可免费取消',
      '不可取消'
    ]
    
    return {
      checkInTime: checkInTimes[Math.floor(Math.random() * checkInTimes.length)],
      checkOutTime: checkOutTimes[Math.floor(Math.random() * checkOutTimes.length)],
      cancellationPolicy: cancellationPolicies[Math.floor(Math.random() * cancellationPolicies.length)],
      paymentMethods: ['信用卡', '支付宝', '微信支付', '现金']
    }
  }

  // 生成模拟图片
  generateMockImages(hotelId) {
    const imageTypes = ['exterior', 'lobby', 'room', 'restaurant', 'swimming pool', 'gym', 'meeting room', 'bar']
    const images = []
    
    // 生成4-6张图片
    const count = Math.floor(Math.random() * 3) + 4
    for (let i = 0; i < count; i++) {
      const imageType = imageTypes[Math.floor(Math.random() * imageTypes.length)]
      images.push(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20${imageType}%20${hotelId}&image_size=landscape_16_9`)
    }
    
    return images
  }

  // 生成模拟的评论数据
  generateMockReviews() {
    const reviewTexts = [
      '酒店环境很好，服务周到，下次还会再来。',
      '房间干净整洁，设施齐全，位置便利。',
      '性价比很高，推荐给大家。',
      '服务态度很好，有求必应。',
      '酒店早餐很丰富，味道不错。',
      '房间隔音效果很好，睡得很舒服。',
      '位置很好，交通便利，周边配套齐全。',
      '酒店装修很有特色，很喜欢。',
      '前台服务很热情，办理入住很迅速。',
      '房间宽敞明亮，床很舒适。',
      '酒店的设施很新，维护得很好。',
      '周边环境很安静，适合休息。'
    ]
    
    const reviews = []
    const reviewCount = Math.floor(Math.random() * 5) + 3
    
    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        id: i + 1,
        userName: `用户${i + 1}`,
        rating: Math.floor(Math.random() * 5) + 1,
        text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
        date: this.getRandomDate()
      })
    }
    
    return reviews
  }

  // 生成模拟的周边环境数据
  generateMockSurroundings(address) {
    const landmarks = [
      '购物中心',
      '地铁站',
      '公交站',
      '餐厅',
      '咖啡厅',
      '公园',
      '医院',
      '学校',
      '银行',
      '超市',
      '电影院',
      '健身房',
      '加油站',
      '药店',
      '便利店'
    ]
    
    const surroundings = []
    const landmarkCount = Math.floor(Math.random() * 5) + 3
    
    for (let i = 0; i < landmarkCount; i++) {
      const landmark = landmarks[Math.floor(Math.random() * landmarks.length)]
      const distance = (Math.random() * 1000).toFixed(0)
      surroundings.push({
        name: landmark,
        distance: `${distance}米`,
        description: `距离酒店约${distance}米的${landmark}`
      })
    }
    
    return surroundings
  }

  // 获取随机日期
  getRandomDate() {
    const now = new Date()
    const past = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    return past.toISOString().split('T')[0]
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 导出单例
export default new ScraperService()
