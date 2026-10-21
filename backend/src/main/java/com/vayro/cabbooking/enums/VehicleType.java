package com.vayro.cabbooking.enums;

public enum VehicleType {
    BIKE(1.0, 15.0),
    AUTO(1.2, 25.0),
    SEDAN(1.5, 40.0),
    SUV(2.0, 60.0),
    LUXURY(3.0, 100.0);

    private final double fareMultiplier;
    private final double baseFare;

    VehicleType(double fareMultiplier, double baseFare) {
        this.fareMultiplier = fareMultiplier;
        this.baseFare = baseFare;
    }

    public double getFareMultiplier() {
        return fareMultiplier;
    }

    public double getBaseFare() {
        return baseFare;
    }
}
