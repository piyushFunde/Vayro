package com.vayro.cabbooking.repository;

import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.User;
import com.vayro.cabbooking.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    Optional<Driver> findByUser(User user);
    Optional<Driver> findByUserId(UUID userId);
    List<Driver> findByStatus(DriverStatus status);

    // Find nearby available drivers using Haversine formula (distance in km <= maxDistanceKm)
    @Query(value = """
        SELECT d.*, 
        (6371 * acos(cos(radians(:latitude)) * cos(radians(d.current_lat)) * cos(radians(d.current_lng) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.current_lat)))) AS distance
        FROM drivers d
        WHERE d.status = 'AVAILABLE' 
          AND d.is_verified = true
          AND d.current_lat IS NOT NULL 
          AND d.current_lng IS NOT NULL
        HAVING (6371 * acos(cos(radians(:latitude)) * cos(radians(d.current_lat)) * cos(radians(d.current_lng) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(d.current_lat)))) <= :maxDistanceKm
        ORDER BY distance ASC
        """, nativeQuery = true)
    List<Driver> findNearbyAvailableDrivers(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("maxDistanceKm") Double maxDistanceKm
    );
}
