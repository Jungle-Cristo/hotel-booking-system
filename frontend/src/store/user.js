import { defineStore } from 'pinia'

const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    userInfo: {},
    token: ''
  }),
  getters: {
    getToken: (state) => state.token,
    getUserInfo: (state) => state.userInfo
  },
  actions: {
    login(userInfo, token) {
      this.isLoggedIn = true
      this.userInfo = userInfo
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    logout() {
      this.isLoggedIn = false
      this.userInfo = {}
      this.token = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    initUser() {
      const token = localStorage.getItem('token')
      const userInfo = localStorage.getItem('userInfo')
      if (token && userInfo) {
        this.isLoggedIn = true
        this.token = token
        this.userInfo = JSON.parse(userInfo)
      }
    }
  }
})

export default useUserStore