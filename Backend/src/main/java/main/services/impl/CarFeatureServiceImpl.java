package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.entities.CarFeature;
import main.repositories.CarFeatureRepository;
import main.services.CarFeatureService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarFeatureServiceImpl implements CarFeatureService {

    private final CarFeatureRepository carFeatureRepository;
    private final ModelMapper modelMapper;

    @Override
    public CarFeatureResponse create(CreateCarFeatureRequest request) {
        CarFeature entity = CarFeature.builder()
                .featureName(request.getFeatureName())
                .featureDescription(request.getFeatureDescription())
                .build();
        CarFeature saved = carFeatureRepository.save(entity);
        return modelMapper.map(saved, CarFeatureResponse.class);
    }

    @Override
    public CarFeatureResponse getById(UUID featureId) {
        CarFeature entity = carFeatureRepository.findById(featureId)
                .orElseThrow(() -> new IllegalArgumentException("Car feature not found: " + featureId));

        return modelMapper.map(entity, CarFeatureResponse.class);
    }

    @Override
    public List<CarFeatureResponse> getAll() {
        return carFeatureRepository.findAll().stream()
                .map(e -> modelMapper.map(e, CarFeatureResponse.class))
                .toList();
    }

    @Override
    public CarFeatureResponse update(UUID featureId, CreateCarFeatureRequest request) {
        CarFeature entity = carFeatureRepository.findById(featureId)
                .orElseThrow(() -> new IllegalArgumentException("CarFeature not found: " + featureId));

        entity.setFeatureName(request.getFeatureName());
        entity.setFeatureDescription(request.getFeatureDescription());

        CarFeature saved = carFeatureRepository.save(entity);
        return modelMapper.map(saved, CarFeatureResponse.class);
    }

    @Override
    public void delete(UUID featureId) {
        if (!carFeatureRepository.existsById(featureId)) {
            throw new IllegalArgumentException("CarFeature not found: " + featureId);
        }
        carFeatureRepository.deleteById(featureId);
    }
}
