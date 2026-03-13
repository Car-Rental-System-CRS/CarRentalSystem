package main.repositories;

import main.dtos.response.CarTypeResponse;
import main.entities.CarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CarTypeRepository extends JpaRepository<CarType, UUID>, JpaSpecificationExecutor<CarType> {

    // Fetches parents + Brand + Features
    @Query("SELECT DISTINCT ct FROM CarType ct LEFT JOIN FETCH ct.carBrand LEFT JOIN FETCH ct.modelFeatures mf LEFT JOIN FETCH mf.carFeature")
    List<CarType> findAllWithFeatures();

    // Fetches Cars for specific parents
    @Query("SELECT DISTINCT ct FROM CarType ct JOIN FETCH ct.cars WHERE ct IN :carTypes")
    List<CarType> fetchCarsForTypes(@Param("carTypes") List<CarType> carTypes);
}

