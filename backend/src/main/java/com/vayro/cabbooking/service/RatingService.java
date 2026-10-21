package com.vayro.cabbooking.service;

import com.vayro.cabbooking.dto.request.RatingRequest;
import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.Rating;
import com.vayro.cabbooking.entity.Ride;
import com.vayro.cabbooking.enums.RideStatus;
import com.vayro.cabbooking.exception.BadRequestException;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.DriverRepository;
import com.vayro.cabbooking.repository.RatingRepository;
import com.vayro.cabbooking.repository.RideRepository;
import com.vayro.cabbooking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;

    @Transactional
    public Rating submitRating(UserPrincipal principal, RatingRequest request) {
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getRider().getId().equals(principal.getId())) {
            throw new BadRequestException("Only the rider who took this trip can submit a rating");
        }

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new BadRequestException("Ratings can only be submitted for completed rides");
        }

        if (ratingRepository.findByRide(ride).isPresent()) {
            throw new BadRequestException("You have already reviewed this ride");
        }

        Driver driver = ride.getDriver();
        if (driver == null) {
            throw new BadRequestException("No driver was assigned to this ride");
        }

        Rating rating = Rating.builder()
                .ride(ride)
                .rider(ride.getRider())
                .driver(driver)
                .ratingScore(request.getRatingScore())
                .feedbackComment(request.getFeedbackComment())
                .build();

        Rating savedRating = ratingRepository.save(rating);

        // Recalculate driver's rolling average
        Double avgRating = ratingRepository.calculateAverageRatingForDriver(driver);
        if (avgRating != null) {
            double rounded = BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP).doubleValue();
            driver.setRatingAvg(rounded);
            driverRepository.save(driver);
        }

        return savedRating;
    }
}
