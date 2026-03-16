package com.hotelbooking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.entity.Booking;
import com.hotelbooking.entity.Room;
import com.hotelbooking.entity.User;
import com.hotelbooking.mapper.BookingMapper;
import com.hotelbooking.mapper.RoomMapper;
import com.hotelbooking.mapper.UserMapper;
import com.hotelbooking.service.BookingService;
import com.hotelbooking.vo.BookingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingMapper bookingMapper;

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(request.getUserId());
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 2. 校验房间是否存在且可用
        Room room = roomMapper.selectById(request.getRoomId());
        if (room == null) {
            throw new RuntimeException("房间不存在");
        }
        if (room.getStatus() != 1) {
            throw new RuntimeException("房间不可用");
        }
        if (room.getStock() <= 0) {
            throw new RuntimeException("房间库存不足");
        }

        // 3. 校验日期是否合法
        LocalDateTime now = LocalDateTime.now();
        if (request.getCheckInTime().isBefore(now)) {
            throw new RuntimeException("入住时间不能早于当前时间");
        }
        if (request.getCheckOutTime().isBefore(request.getCheckInTime())) {
            throw new RuntimeException("退房时间不能早于入住时间");
        }

        // 4. 计算价格（简化计算，实际可能需要更复杂的逻辑）
        long days = java.time.Duration.between(request.getCheckInTime(), request.getCheckOutTime()).toDays();
        if (days <= 0) {
            days = 1;
        }
        BigDecimal totalPrice = room.getPrice().multiply(new BigDecimal(days));

        // 5. 扣减房间库存
        room.setStock(room.getStock() - 1);
        roomMapper.updateById(room);

        // 6. 生成订单号
        String orderNo = "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // 7. 创建预订订单
        Booking booking = new Booking();
        booking.setOrderNo(orderNo);
        booking.setUserId(request.getUserId());
        booking.setHotelId(request.getHotelId());
        booking.setRoomId(request.getRoomId());
        booking.setCheckInTime(request.getCheckInTime());
        booking.setCheckOutTime(request.getCheckOutTime());
        booking.setContactPhone(request.getContactPhone());
        booking.setTotalPrice(totalPrice);
        booking.setStatus("PENDING");
        // 设置30分钟过期时间
        LocalDateTime expireTime = now.plusMinutes(30);
        booking.setExpiredAt(expireTime);
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);

        bookingMapper.insert(booking);

        log.info("用户{}成功预订房间{}，订单号：{}", request.getUserId(), request.getRoomId(), orderNo);

        // 8. 构建响应
        BookingResponse response = new BookingResponse();
        response.setOrderNo(orderNo);
        response.setBookingId(booking.getId());
        response.setTotalPrice(totalPrice);
        response.setExpireTime(expireTime);
        response.setMessage("请在30分钟内完成支付");

        return response;
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {
        // 1. 查询预订信息
        Booking booking = bookingMapper.selectById(bookingId);
        if (booking == null) {
            throw new RuntimeException("预订不存在");
        }

        // 2. 校验预订状态
        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("只能取消待支付状态的预订");
        }

        // 3. 恢复房间库存
        Room room = roomMapper.selectById(booking.getRoomId());
        if (room != null) {
            room.setStock(room.getStock() + 1);
            roomMapper.updateById(room);
        }

        // 4. 更新预订状态
        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        bookingMapper.updateById(booking);

        log.info("预订{}已取消", bookingId);
    }

}