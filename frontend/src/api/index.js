import axios from '../utils/axios'

// 酒店相关 API
export const hotelApi = {
  // 获取酒店列表
  getHotels: (params) => axios.get('/hotels', { params }),
  // 获取酒店详情
  getHotelDetail: (id) => axios.get(`/hotels/${id}`),
  // 获取酒店房间
  getHotelRooms: (hotelId) => axios.get(`/hotels/${hotelId}/rooms`)
}

// 房间相关 API
export const roomApi = {
  // 获取房间详情
  getRoomDetail: (id) => axios.get(`/rooms/${id}`),
  // 检查房间库存
  checkRoomStock: (roomId, checkInTime, checkOutTime) => axios.get(`/rooms/${roomId}/stock`, {
    params: { checkInTime, checkOutTime }
  })
}

// 预订相关 API
export const bookingApi = {
  // 创建预订
  createBooking: (data) => axios.post('/bookings', data),
  // 取消预订
  cancelBooking: (id) => axios.put(`/bookings/cancel/${id}`),
  // 获取用户预订列表
  getUserBookings: (userId) => axios.get(`/bookings/user/${userId}`),
  // 获取预订详情
  getBookingDetail: (id) => axios.get(`/bookings/${id}`)
}

// 用户相关 API
export const userApi = {
  // 用户登录
  login: (data) => axios.post('/auth/login', data),
  // 用户注册
  register: (data) => axios.post('/auth/register', data),
  // 获取用户信息
  getUserInfo: (id) => axios.get(`/users/${id}`),
  // 更新用户信息
  updateUserInfo: (id, data) => axios.put(`/users/${id}`, data)
}

// 支付相关 API
export const paymentApi = {
  // 创建支付
  createPayment: (data) => axios.post('/payments', data),
  // 支付回调
  paymentCallback: (data) => axios.post('/payments/callback', data)
}