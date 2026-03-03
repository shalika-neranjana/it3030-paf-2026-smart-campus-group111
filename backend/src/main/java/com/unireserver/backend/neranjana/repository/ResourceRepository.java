package com.unireserver.backend.neranjana.repository;

import com.unireserver.backend.neranjana.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByType(String type);
    
    List<Resource> findByStatus(Resource.ResourceStatus status);
    
    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'location': { '$regex': ?0, '$options': 'i' } }, { 'description': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Resource> searchResources(String keyword);
    
    List<Resource> findByTypeAndStatus(String type, Resource.ResourceStatus status);
}
