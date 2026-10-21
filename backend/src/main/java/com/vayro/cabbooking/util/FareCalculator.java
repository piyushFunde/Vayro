package com.vayro.cabbooking.util;

import com.vayro.cabbooking.enums.VehicleType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class FareCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double RATE_PER_KM = 12.0; // base rate $12 per km
    private static final double RATE_PER_MINUTE = 2.0; // $2 per minute
    private static final double AVERAGE_SPEED_KMH = 30.0; // average city speed 30 km/h

    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;

        // Round to 2 decimal places, minimum 0.5 km
        return BigDecimal.valueOf(Math.max(0.5, distance))
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    public int calculateDurationMinutes(double distanceKm) {
        double hours = distanceKm / AVERAGE_SPEED_KMH;
        int minutes = (int) Math.ceil(hours * 60.0);
        return Math.max(5, minutes); // minimum 5 minutes
    }

    public double calculateFare(double distanceKm, int durationMinutes, VehicleType vehicleType) {
        double base = vehicleType.getBaseFare();
        double distanceCost = distanceKm * RATE_PER_KM * vehicleType.getFareMultiplier();
        double timeCost = durationMinutes * RATE_PER_MINUTE;

        double total = base + distanceCost + timeCost;
        return BigDecimal.valueOf(total)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
