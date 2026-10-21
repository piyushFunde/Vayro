package com.vayro.cabbooking.repository;

import com.vayro.cabbooking.entity.Payment;
import com.vayro.cabbooking.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByRide(Ride ride);
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
}
