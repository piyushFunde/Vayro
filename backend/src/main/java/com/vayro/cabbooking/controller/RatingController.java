package com.vayro.cabbooking.controller;

import com.vayro.cabbooking.dto.request.RatingRequest;
import com.vayro.cabbooking.entity.Rating;
import com.vayro.cabbooking.security.UserPrincipal;
import com.vayro.cabbooking.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<Rating> submitRating(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RatingRequest request
    ) {
        Rating rating = ratingService.submitRating(principal, request);
        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }
}
