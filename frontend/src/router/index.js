import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/hotels',
    name: 'HotelList',
    component: () => import('../views/HotelList.vue')
  },
  {
    path: '/booking/:roomId',
    name: 'RoomBooking',
    component: () => import('../views/RoomBooking.vue')
  },
  {
    path: '/booking/confirm/:bookingId',
    name: 'BookingConfirm',
    component: () => import('../views/BookingConfirm.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue')
  },
  {
    path: '/bookings',
    name: 'UserBookings',
    component: () => import('../views/UserBookings.vue')
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue')
  },
  {
    path: '/hotel/:id',
    name: 'HotelDetail',
    component: () => import('../views/HotelDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router