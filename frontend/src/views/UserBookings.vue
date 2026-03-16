<template>
  <div class="user-bookings">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>我的预订</span>
        </div>
      </template>
      
      <el-table :data="bookings" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="200"></el-table-column>
        <el-table-column prop="hotelName" label="酒店名称"></el-table-column>
        <el-table-column prop="roomType" label="房间类型" width="120"></el-table-column>
        <el-table-column prop="checkInTime" label="入住时间"></el-table-column>
        <el-table-column prop="checkOutTime" label="退房时间"></el-table-column>
        <el-table-column prop="totalPrice" label="总价格" width="100" align="right">
          <template #default="scope">
            <span class="price">{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewBookingDetail(scope.row.id)">查看</el-button>
            <el-button size="small" type="danger" @click="cancelBooking(scope.row.id)" v-if="scope.row.status === 'PENDING'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination" style="margin-top: 20px">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { bookingApi } from '../api'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

const bookings = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'PAID': return 'success'
    case 'CANCELLED': return 'danger'
    case 'COMPLETED': return 'info'
    default: return 'info'
  }
}

const loadBookings = async () => {
  try {
    // 这里应该调用真实的 API，现在使用模拟数据
    // const response = await bookingApi.getUserBookings(1, { page: currentPage.value, size: pageSize.value })
    // bookings.value = response.data
    // total.value = response.total
    
    // 模拟数据
    bookings.value = [
      {
        id: 1,
        orderNo: 'ORD20260313123456',
        hotelName: '北京希尔顿酒店',
        roomType: '豪华大床房',
        checkInTime: '2026-03-14 14:00',
        checkOutTime: '2026-03-16 12:00',
        totalPrice: '2560.00',
        status: 'PENDING'
      },
      {
        id: 2,
        orderNo: 'ORD20260312987654',
        hotelName: '上海外滩华尔道夫酒店',
        roomType: '江景套房',
        checkInTime: '2026-03-20 14:00',
        checkOutTime: '2026-03-22 12:00',
        totalPrice: '3880.00',
        status: 'PAID'
      },
      {
        id: 3,
        orderNo: 'ORD20260311135792',
        hotelName: '广州四季酒店',
        roomType: '行政大床房',
        checkInTime: '2026-03-25 14:00',
        checkOutTime: '2026-03-27 12:00',
        totalPrice: '1980.00',
        status: 'CANCELLED'
      }
    ]
    total.value = 3
  } catch (error) {
    console.error('加载预订列表失败:', error)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadBookings()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  loadBookings()
}

const viewBookingDetail = (bookingId) => {
  router.push(`/booking/confirm/${bookingId}`)
}

const cancelBooking = async (bookingId) => {
  try {
    // 这里应该调用真实的 API，现在使用模拟数据
    // await bookingApi.cancelBooking(bookingId)
    
    // 模拟取消成功
    ElMessageBox.confirm('确定要取消预订吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      loadBookings()
    })
  } catch (error) {
    console.error('取消预订失败:', error)
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.user-bookings {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.price {
  color: #ff4d4f;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
}
</style>