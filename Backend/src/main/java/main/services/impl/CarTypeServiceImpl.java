package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.entities.MediaFile;
import main.entities.ModelFeature;
import main.mappers.CarTypeMapper;
import main.repositories.CarBrandRepository;
import main.repositories.CarTypeRepository;
import main.repositories.ModelFeatureRepository;
import main.services.CarTypeService;
import main.services.MediaFileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarTypeServiceImpl implements CarTypeService {
    private final CarTypeRepository carTypeRepository;
    private final CarBrandRepository carBrandRepository;
    private final MediaFileService mediaFileService;
    private final ModelFeatureRepository modelFeatureRepository;
    private final CarTypeMapper carTypeMapper;

    @Override
    @Transactional
    public CarTypeResponse createType(CreateCarTypeRequest request, MultipartFile[] images) {

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        CarType entity = carTypeMapper.toEntity(request, brand);

        CarType saved = carTypeRepository.save(entity);

        if (images != null && images.length > 0) {
            for (int i = 0; i < images.length; i++) {
                mediaFileService.uploadMediaFile(saved.getId(), images[i], null, i);
            }
        }

        CarType refreshed = carTypeRepository.findById(saved.getId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after save"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarTypeId(saved.getId(), Pageable.unpaged())
                .getContent();
        
        return carTypeMapper.toResponseWithFeatures(refreshed, modelFeatures);
    }

    @Override
    public CarTypeResponse getTypeById(UUID id) {

        CarType entity = carTypeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + id));

        List<ModelFeature> modelFeatures = modelFeatureRepository.findByCarTypeId(id, Pageable.unpaged()).getContent();
        
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
                            .findByCarTypeId(carType.getId(), Pageable.unpaged())
                            .getContent();
                    return carTypeMapper.toResponseWithFeatures(carType, modelFeatures);
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, carTypePage.getTotalElements());
    }


    @Override
    @Transactional
    public CarTypeResponse updateType(UUID id, CreateCarTypeRequest request, MultipartFile[] images) {

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
                mediaFileService.uploadMediaFile(saved.getId(), images[i], null, startOrder + i);
            }
        }

        CarType refreshed = carTypeRepository.findById(saved.getId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after update"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarTypeId(saved.getId(), Pageable.unpaged())
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
    public CarTypeResponse addImagesToCarType(UUID carTypeId, MultipartFile[] images) {
        CarType carType = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + carTypeId));

        if (images == null || images.length == 0) {
            throw new IllegalArgumentException("No images provided");
        }

        List<MediaFile> existingMedia = mediaFileService.getMediaFilesByCarType(carTypeId);
        int startOrder = existingMedia.isEmpty() ? 0 : existingMedia.size();

        for (int i = 0; i < images.length; i++) {
            mediaFileService.uploadMediaFile(carTypeId, images[i], null, startOrder + i);
        }

        CarType refreshed = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found after adding images"));
        List<ModelFeature> modelFeatures = modelFeatureRepository
                .findByCarTypeId(carTypeId, Pageable.unpaged())
                .getContent();
        
        return carTypeMapper.toResponseWithFeatures(refreshed, modelFeatures);
    }

    @Override
    @Transactional
    public void removeImageFromCarType(UUID imageId) {
        mediaFileService.deleteMediaFile(imageId);
    }
}
