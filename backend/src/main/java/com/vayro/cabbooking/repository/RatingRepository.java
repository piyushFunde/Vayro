package com.vayro.cabbooking.repository;

import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.Rating;
import com.vayro.cabbooking.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {
    Optional<Rating> findByRide(Ride ride);
    List<Rating> findByDriverOrderByCreatedAtDesc(Driver driver);

    @Query("SELECT AVG(r.ratingScore) FROM Rating r WHERE r.driver = :driver")
    Double calculateAverageRatingForDriver(@Param("driver") Driver driver);
}
