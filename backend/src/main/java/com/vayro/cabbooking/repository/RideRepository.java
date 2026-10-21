package com.vayro.cabbooking.repository;

import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.Ride;
import com.vayro.cabbooking.entity.User;
import com.vayro.cabbooking.enums.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {
    List<Ride> findByRiderOrderByCreatedAtDesc(User rider);
    List<Ride> findByDriverOrderByCreatedAtDesc(Driver driver);
    List<Ride> findByStatus(RideStatus status);
    Optional<Ride> findFirstByRiderAndStatusInOrderByCreatedAtDesc(User rider, List<RideStatus> statuses);
    Optional<Ride> findFirstByDriverAndStatusInOrderByCreatedAtDesc(Driver driver, List<RideStatus> statuses);
}
