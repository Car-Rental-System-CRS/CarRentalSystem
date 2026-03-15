package main.services.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarAvailabilityResponse;
import main.dtos.response.CarResponse;
import main.dtos.response.CarTypeResponse;
import main.entities.Car;
import main.entities.CarBrand;
import main.entities.CarType;
import main.entities.MediaFile;
import main.entities.ModelFeature;
import main.enums.BookingStatus;
import main.mappers.CarMapper;
import main.mappers.CarTypeMapper;
import main.repositories.BookingCarRepository;
import main.repositories.CarBrandRepository;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.repositories.ModelFeatureRepository;
import main.services.CarTypeService;
import main.services.MediaFileService;

@Service
@RequiredArgsConstructor
public class CarTypeServiceImpl implements CarTypeService {
    private final CarTypeRepository carTypeRepository;
    private final CarBrandRepository carBrandRepository;
    private final CarRepository carRepository;
    private final BookingCarRepository bookingCarRepository;
    private final MediaFileService mediaFileService;
    private final ModelFeatureRepository modelFeatureRepository;
    private final CarTypeMapper carTypeMapper;
    
    // Business rule: Invalid Days After Each Rental (buffer period)
    private static final int IDAER = 1;
    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(
            BookingStatus.CREATED,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS
    );

    @Override
    @Transactional
    public CarTypeResponse createType(CreateCarTypeRequest request, MultipartFile[] images, String[] imageDescriptions) {

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        CarType entity = carTypeMapper.toEntity(request, brand);

        CarType saved = carTypeRepository.save(entity);

        if (images != null && images.length > 0) {
            for (int i = 0; i < images.length; i++) {
                String description = (imageDescriptions != null && i < imageDescriptions.length) 
                    ? imageDescriptions[i] : null;
                
                // Log for debugging
                System.out.println("Processing image " + i + " with description: " + description);
                
                mediaFileService.uploadMediaFile(saved.getId(), images[i], description, i);
            }
        }

        CarType refreshed = carTypeRepository.findById(saved.getId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after save"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarType_Id(saved.getId(), Pageable.unpaged())
                .getContent();
        
        return carTypeMapper.toResponseWithFeatures(refreshed, modelFeatures);
    }

    @Override
    public CarTypeResponse getTypeById(UUID id) {

        CarType entity = carTypeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + id));

        List<ModelFeature> modelFeatures = modelFeatureRepository.findByCarType_Id(id, Pageable.unpaged()).getContent();
        
        return carTypeMapper.toResponseWithFeatures(entity, modelFeatures);
    }

    @Override
    public Page<CarTypeResponse> getAllTypes(
            Pageable pageable,
            Specification<CarType> specification
    ) {
        Page<CarType> carTypePage = carTypeRepository.findAll(specification, pageable);
        
        List<CarTypeResponse> responses = carTypePage.getContent().stream()
                .map(carType -> {
                    List<ModelFeature> modelFeatures = modelFeatureRepository
                            .findByCarType_Id(carType.getId(), Pageable.unpaged())
                            .getContent();
                    return carTypeMapper.toResponseWithFeatures(carType, modelFeatures);
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, carTypePage.getTotalElements());
    }


    @Override
    @Transactional
    public CarTypeResponse updateType(UUID id, CreateCarTypeRequest request, MultipartFile[] images, String[] imageDescriptions) {

        CarType entity = carTypeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + id));
        
        entity.setNumberOfSeats(request.getNumberOfSeats());
        entity.setName(request.getName());
        entity.setConsumptionKwhPerKm(request.getConsumptionKwhPerKm());
        entity.setPrice(request.getPrice());

        CarType saved = carTypeRepository.save(entity);

        if (images != null && images.length > 0) {
            List<MediaFile> existingMedia = mediaFileService.getMediaFilesByCarType(id);
            int startOrder = existingMedia.isEmpty() ? 0 : existingMedia.size();
            
            for (int i = 0; i < images.length; i++) {
                String description = (imageDescriptions != null && i < imageDescriptions.length) 
                    ? imageDescriptions[i] : null;
                mediaFileService.uploadMediaFile(saved.getId(), images[i], description, startOrder + i);
            }
        }

        CarType refreshed = carTypeRepository.findById(saved.getId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after update"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarType_Id(saved.getId(), Pageable.unpaged())
                .getContent();
        
        return carTypeMapper.toResponseWithFeatures(refreshed, modelFeatures);
    }

    @Override
    @Transactional
    public void deleteType(UUID id) {

        if (!carTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Car type not found: " + id);
        }

        mediaFileService.deleteMediaFilesByCarType(id);

        carTypeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public CarTypeResponse addImagesToCarType(UUID carTypeId, MultipartFile[] images, String[] imageDescriptions) {
        // Validate car type exists
        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }

        if (images == null || images.length == 0) {
            throw new IllegalArgumentException("No images provided");
        }

        List<MediaFile> existingMedia = mediaFileService.getMediaFilesByCarType(carTypeId);
        int startOrder = existingMedia.isEmpty() ? 0 : existingMedia.size();

        for (int i = 0; i < images.length; i++) {
            String description = (imageDescriptions != null && i < imageDescriptions.length) 
                ? imageDescriptions[i] : null;
            mediaFileService.uploadMediaFile(carTypeId, images[i], description, startOrder + i);
        }

        CarType refreshed = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after adding images"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarType_Id(carTypeId, Pageable.unpaged())
                .getContent();
        
        return carTypeMapper.toResponseWithFeatures(refreshed, modelFeatures);
    }

    @Override
    @Transactional
    public void removeImageFromCarType(UUID imageId) {
        mediaFileService.deleteMediaFile(imageId);
    }

    @Override
    public CarAvailabilityResponse checkAvailability(UUID carTypeId, LocalDateTime pickupDateTime, LocalDateTime returnDateTime) {
        // Validate and get car type
        CarType carType = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + carTypeId));
        
        String carTypeName = carType.getName();
        BigDecimal pricePerHour = carType.getPrice();
        BigDecimal pricePerDay = pricePerHour.multiply(BigDecimal.valueOf(24));
        
        // Get all cars for this car type
        List<Car> allCars = carRepository.findByCarTypeId(carTypeId);
        int totalCount = allCars.size();
        
        if (totalCount == 0) {
            return CarAvailabilityResponse.builder()
                    .carTypeId(carTypeId)
                    .carTypeName(carTypeName)
                    .totalCount(0)
                    .availableCount(0)
                    .pricePerHour(pricePerHour)
                    .pricePerDay(pricePerDay)
                    .pickupDateTime(pickupDateTime)
                    .returnDateTime(returnDateTime)
                    .build();
        }
        
        int availableCount = findAvailableCars(carTypeId, pickupDateTime, returnDateTime).size();
        
        return CarAvailabilityResponse.builder()
                .carTypeId(carTypeId)
                .carTypeName(carTypeName)
                .totalCount(totalCount)
                .availableCount(Math.max(0, availableCount))
                .pricePerHour(pricePerHour)
                .pricePerDay(pricePerDay)
                .pickupDateTime(pickupDateTime)
                .returnDateTime(returnDateTime)
                .build();
    }

    @Override
    public List<CarResponse> getAvailableCars(UUID carTypeId, LocalDateTime pickupDateTime, LocalDateTime returnDateTime) {
        if (!pickupDateTime.isBefore(returnDateTime)) {
            throw new IllegalArgumentException("Return date must be after pickup date");
        }

        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }

        return findAvailableCars(carTypeId, pickupDateTime, returnDateTime).stream()
                .map(CarMapper::toResponseWithDamageImages)
                .toList();
    }

    private List<Car> findAvailableCars(UUID carTypeId, LocalDateTime pickupDateTime, LocalDateTime returnDateTime) {
        List<Car> allCars = carRepository.findByCarTypeId(carTypeId);
        if (allCars.isEmpty()) {
            return List.of();
        }

        LocalDateTime bufferedPickup = pickupDateTime.minusDays(IDAER);
        LocalDateTime bufferedReturn = returnDateTime.plusDays(IDAER);

        List<UUID> carIds = allCars.stream().map(Car::getId).toList();
        List<UUID> unavailableCarIds = bookingCarRepository.findUnavailableCarIds(
                carIds,
                bufferedPickup,
                bufferedReturn,
                BLOCKING_STATUSES
        );

        return allCars.stream()
                .filter(car -> !unavailableCarIds.contains(car.getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarType> getAllInventoryWithData() {
        // 1. Fetch the bulk of the data
        List<CarType> carTypes = carTypeRepository.findAllWithFeatures();

        // 2. Fetch the cars for those specific types
        if (!carTypes.isEmpty()) {
            carTypeRepository.fetchCarsForTypes(carTypes);
        }

        return carTypes;
    }

}
