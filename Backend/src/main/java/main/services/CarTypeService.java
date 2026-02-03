package main.services;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface CarTypeService {
    CarTypeResponse createType(CreateCarTypeRequest request, MultipartFile[] images);

    CarTypeResponse getTypeById(UUID id);

    Page<CarTypeResponse> getAllTypes(
            Pageable pageable,
            Specification<CarType> specification
    );

    CarTypeResponse updateType(UUID id, CreateCarTypeRequest request, MultipartFile[] images);

    void deleteType(UUID id);
    
    CarTypeResponse addImagesToCarType(UUID carTypeId, MultipartFile[] images);
    
    void removeImageFromCarType(UUID imageId);
}
