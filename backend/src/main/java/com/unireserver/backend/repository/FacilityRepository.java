package com.unireserver.backend.repository;

import com.unireserver.backend.model.Facility;
import com.unireserver.backend.model.FacilityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findByType(FacilityType type);
    List<Facility> findByLocationContainingIgnoreCase(String location);
    List<Facility> findByCapacityGreaterThanEqual(Integer capacity);
}
