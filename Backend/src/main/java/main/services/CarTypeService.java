package main.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarAvailabilityResponse;
import main.dtos.response.CarTypeResponse;
import main.entities.CarType;

public interface CarTypeService {
    CarTypeResponse createType(CreateCarTypeRequest request, MultipartFile[] images, String[] imageDescriptions);

    CarTypeResponse getTypeById(UUID id);

    Page<CarTypeResponse> getAllTypes(
            Pageable pageable,
            Specification<CarType> specification
    );

    CarTypeResponse updateType(UUID id, CreateCarTypeRequest request, MultipartFile[] images, String[] imageDescriptions);

    void deleteType(UUID id);
    
    CarTypeResponse addImagesToCarType(UUID carTypeId, MultipartFile[] images, String[] imageDescriptions);
    
    void removeImageFromCarType(UUID imageId);
    
    /**
     * Check car availability for a specific car type within a date range
     */
    CarAvailabilityResponse checkAvailability(UUID carTypeId, LocalDateTime pickupDateTime, LocalDateTime returnDateTime);
}
