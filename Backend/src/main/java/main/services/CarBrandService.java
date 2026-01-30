package main.services;

import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.entities.CarBrand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public interface CarBrandService {
    CarBrandResponse createBrand(CreateCarBrandRequest request);

    CarBrandResponse getBrandById(UUID brandId);

    Page<CarBrandResponse> getAllBrands(
            Pageable pageable,
            Specification<CarBrand> specification
    );

    CarBrandResponse updateBrand(UUID brandId, CreateCarBrandRequest request);

    void deleteBrand(UUID brandId);
}
