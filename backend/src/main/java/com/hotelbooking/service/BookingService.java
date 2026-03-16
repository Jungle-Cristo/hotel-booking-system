package com.hotelbooking.service;

import com.hotelbooking.dto.BookingRequest;
import com.hotelbooking.vo.BookingResponse;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    void cancelBooking(Long bookingId);
}