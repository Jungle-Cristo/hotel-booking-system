// 酒店数据管理服务
import { hotelApi } from '../api'
import scraperService from './scraperService'

class HotelService {
  constructor() {
    this.hotels = JSON.parse(localStorage.getItem('hotels')) || []
    this.hotelDetails = JSON.parse(localStorage.getItem('hotelDetails')) || {}
    this.lastUpdate = JSON.parse(localStorage.getItem('hotelLastUpdate')) || {}
    this.dataExpiry = 24 * 60 * 60 * 1000 // 24小时过期
  }

  // 获取酒店列表
  async getHotels(params = {}) {
    try {
      // 首先尝试从API获取数据
      const response = await hotelApi.getHotels(params)
      this.hotels = response.data
      this.saveHotels()
      return response
    } catch (error) {
      console.error('获取酒店列表失败:', error)
      // 如果API失败，使用本地存储的数据
      return {
        data: this.hotels,
        total: this.hotels.length
      }
    }
  }

  // 获取酒店详情
  async getHotelDetail(hotelId) {
    try {
      // 检查本地存储中是否有酒店详情，且未过期
      const lastUpdate = this.lastUpdate[hotelId]
      const now = new Date().getTime()
      const isExpired = !lastUpdate || (now - lastUpdate > this.dataExpiry)

      if (!this.hotelDetails[hotelId] || isExpired) {
        // 从API获取酒店详情
        let response
        try {
          response = await hotelApi.getHotelDetail(hotelId)
        } catch (apiError) {
          console.error('API获取酒店详情失败，使用爬虫数据:', apiError)
          // 如果API失败，使用爬虫服务获取数据
          const hotel = this.hotels.find(h => h.id === hotelId)
          if (hotel) {
            const scrapedData = await scraperService.scrapeHotelDetail(hotelId, hotel.name)
            const reviews = await scraperService.scrapeHotelReviews(hotelId)
            const surroundings = await scraperService.scrapeHotelSurroundings(hotelId, hotel.address)
            
            response = {
              data: {
                ...hotel,
                ...scrapedData,
                reviews,
                surroundings
              }
            }
          } else {
            throw apiError
          }
        }
        
        this.hotelDetails[hotelId] = response.data
        this.lastUpdate[hotelId] = now
        this.saveHotelDetails()
        return response
      } else {
        // 使用本地存储的酒店详情
        return {
          data: this.hotelDetails[hotelId]
        }
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      // 如果API失败，使用本地存储的数据
      if (this.hotelDetails[hotelId]) {
        return {
          data: this.hotelDetails[hotelId]
        }
      } else {
        // 生成默认数据
        const defaultHotel = this.generateDefaultHotel(hotelId)
        this.hotelDetails[hotelId] = defaultHotel
        this.lastUpdate[hotelId] = new Date().getTime()
        this.saveHotelDetails()
        return {
          data: defaultHotel
        }
      }
    }
  }

  // 生成默认酒店数据
  generateDefaultHotel(hotelId) {
    return {
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
  }

  // 保存酒店列表到本地存储
  saveHotels() {
    localStorage.setItem('hotels', JSON.stringify(this.hotels))
  }

  // 保存酒店详情到本地存储
  saveHotelDetails() {
    localStorage.setItem('hotelDetails', JSON.stringify(this.hotelDetails))
    localStorage.setItem('hotelLastUpdate', JSON.stringify(this.lastUpdate))
  }

  // 清除本地存储的酒店数据
  clearHotelData() {
    localStorage.removeItem('hotels')
    localStorage.removeItem('hotelDetails')
    localStorage.removeItem('hotelLastUpdate')
    this.hotels = []
    this.hotelDetails = {}
    this.lastUpdate = {}
  }

  // 更新酒店信息
  updateHotel(hotelId, hotelData) {
    // 确保酒店ID存在
    if (!hotelId) {
      console.error('酒店ID不能为空')
      return
    }

    // 更新酒店列表中的信息
    const hotelIndex = this.hotels.findIndex(h => h.id === hotelId)
    if (hotelIndex !== -1) {
      this.hotels[hotelIndex] = { ...this.hotels[hotelIndex], ...hotelData }
      this.saveHotels()
    }

    // 更新酒店详情
    this.hotelDetails[hotelId] = { ...(this.hotelDetails[hotelId] || {}), ...hotelData }
    this.lastUpdate[hotelId] = new Date().getTime()
    this.saveHotelDetails()
  }

  // 添加新酒店
  addHotel(hotelData) {
    if (!hotelData.id) {
      console.error('酒店ID不能为空')
      return
    }

    // 检查是否已存在
    const existingIndex = this.hotels.findIndex(h => h.id === hotelData.id)
    if (existingIndex !== -1) {
      // 更新现有酒店
      this.hotels[existingIndex] = hotelData
    } else {
      // 添加新酒店
      this.hotels.push(hotelData)
    }

    this.hotelDetails[hotelData.id] = hotelData
    this.lastUpdate[hotelData.id] = new Date().getTime()
    this.saveHotels()
    this.saveHotelDetails()
  }

  // 删除酒店
  deleteHotel(hotelId) {
    this.hotels = this.hotels.filter(h => h.id !== hotelId)
    delete this.hotelDetails[hotelId]
    delete this.lastUpdate[hotelId]
    this.saveHotels()
    this.saveHotelDetails()
  }

  // 批量更新酒店信息
  async batchUpdateHotels(hotelIds) {
    const results = []
    
    for (const hotelId of hotelIds) {
      try {
        // 获取酒店基本信息
        const hotel = this.hotels.find(h => h.id === hotelId)
        if (!hotel) {
          console.error(`酒店 ${hotelId} 不存在`)
          results.push(null)
          continue
        }

        // 爬取酒店详情
        const scrapedDetail = await scraperService.scrapeHotelDetail(hotelId, hotel.name)
        const reviews = await scraperService.scrapeHotelReviews(hotelId)
        const surroundings = await scraperService.scrapeHotelSurroundings(hotelId, hotel.address)

        // 合并数据
        const updatedData = {
          ...hotel,
          ...scrapedDetail,
          reviews,
          surroundings,
          lastUpdated: new Date().toISOString()
        }

        // 更新酒店信息
        this.updateHotel(hotelId, updatedData)
        results.push(updatedData)
      } catch (error) {
        console.error(`更新酒店 ${hotelId} 失败:`, error)
        results.push(null)
      }
    }

    return results
  }

  // 检查酒店信息完整性
  checkHotelDataCompleteness(hotelId) {
    const hotel = this.hotelDetails[hotelId]
    if (!hotel) {
      return false
    }

    // 检查必要字段
    const requiredFields = ['name', 'address', 'type', 'description']
    for (const field of requiredFields) {
      if (!hotel[field]) {
        return false
      }
    }

    // 检查可选字段
    const optionalFields = ['amenities', 'features', 'rooms', 'gallery']
    for (const field of optionalFields) {
      if (!hotel[field] || hotel[field].length === 0) {
        return false
      }
    }

    return true
  }

  // 修复酒店信息完整性
  async fixHotelDataCompleteness(hotelId) {
    const hotel = this.hotelDetails[hotelId] || this.hotels.find(h => h.id === hotelId)
    if (!hotel) {
      console.error(`酒店 ${hotelId} 不存在`)
      return false
    }

    try {
      // 检查缺失的字段
      const missingFields = []
      
      if (!hotel.description) missingFields.push('description')
      if (!hotel.amenities || hotel.amenities.length === 0) missingFields.push('amenities')
      if (!hotel.features || hotel.features.length === 0) missingFields.push('features')
      if (!hotel.gallery || hotel.gallery.length === 0) missingFields.push('gallery')
      if (!hotel.reviews || hotel.reviews.length === 0) missingFields.push('reviews')
      if (!hotel.surroundings || hotel.surroundings.length === 0) missingFields.push('surroundings')
      if (!hotel.policies) missingFields.push('policies')
      if (!hotel.rating) missingFields.push('rating')

      if (missingFields.length === 0) {
        console.log(`酒店 ${hotelId} 信息完整，无需修复`)
        return true
      }

      // 使用定向爬取获取缺失信息
      const missingData = await scraperService.scrapeMissingInfo(hotelId, hotel, missingFields)

      // 合并数据
      const updatedData = {
        ...hotel,
        ...missingData,
        gallery: missingData.images || hotel.gallery || [],
        amenities: missingData.facilities || hotel.amenities || [],
        features: missingData.services || hotel.features || [],
        reviews: missingData.reviews || hotel.reviews || [],
        surroundings: missingData.surroundings || hotel.surroundings || [],
        policies: missingData.policies || hotel.policies || {},
        lastUpdated: new Date().toISOString()
      }

      // 更新酒店信息
      this.updateHotel(hotelId, updatedData)
      console.log(`成功修复酒店 ${hotelId} 的缺失信息:`, missingFields)
      return true
    } catch (error) {
      console.error(`修复酒店 ${hotelId} 信息失败:`, error)
      return false
    }
  }
}

// 导出单例
export default new HotelService()
