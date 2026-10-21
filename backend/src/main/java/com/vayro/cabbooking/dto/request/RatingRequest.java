package com.vayro.cabbooking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RatingRequest {
    @NotNull(message = "Ride ID is required")
    private UUID rideId;

    @NotNull(message = "Rating score is required")
    @Min(value = 1, message = "Minimum rating is 1")
    @Max(value = 5, message = "Maximum rating is 5")
    private Integer ratingScore;

    private String feedbackComment;
}
