package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.entities.CarFeature;
import main.entities.ModelFeature;
import main.entities.ModelFeatureId;
import main.repositories.CarFeatureRepository;
import main.repositories.CarTypeRepository;
import main.repositories.ModelFeatureRepository;
import main.services.CarTypeFeatureService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarTypeFeatureServiceImpl implements CarTypeFeatureService {

    private final ModelFeatureRepository modelFeatureRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final CarTypeRepository carTypeRepository;

    @Override
    public List<CarFeature> getFeaturesByCarTypeId(UUID typeId) {
        // read feature UUIDs from the ModelFeature relation (carFeature entity)
        List<UUID> featureIds = modelFeatureRepository.findByCarTypeIds(typeId)
                .stream()
                .map(mf -> mf.getCarFeature().getFeatureId())
                .collect(Collectors.toList());

        if (featureIds.isEmpty()) {
            return List.of();
        }
        return carFeatureRepository.findAllById(featureIds);
    }

    @Override
    public void replaceFeaturesForCarType(UUID typeId, List<UUID> featureIds) {
        if (!carTypeRepository.existsById(typeId)) {
            throw new IllegalArgumentException("CarType not found: " + typeId);
        }

        // delete existing mappings by navigating to the carType id
        modelFeatureRepository.deleteByCarTypeId(typeId);

        List<ModelFeature> mappings = (featureIds == null ? List.<UUID>of() : featureIds).stream()
                .distinct()
                .map(fid -> {
                    ModelFeature mf = new ModelFeature();
                    // set entity references using getReferenceById to avoid loading full entities
                    mf.setCarType(carTypeRepository.getReferenceById(typeId));
                    mf.setCarFeature(carFeatureRepository.getReferenceById(fid));
                    return mf;
                })
                .collect(Collectors.toList());

        if (!mappings.isEmpty()) {
            modelFeatureRepository.saveAll(mappings);
        }
    }
}
