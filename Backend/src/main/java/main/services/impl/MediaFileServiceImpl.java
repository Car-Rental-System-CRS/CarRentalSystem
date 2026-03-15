package main.services.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import main.entities.Car;
import lombok.RequiredArgsConstructor;
import main.entities.CarType;
import main.entities.MediaFile;
import main.enums.DamageSource;
import main.enums.MediaCategory;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.repositories.MediaFileRepository;
import main.services.MediaFileService;

@Service
@RequiredArgsConstructor
public class MediaFileServiceImpl implements MediaFileService {
    
    private final MediaFileRepository mediaFileRepository;
    private final CarTypeRepository carTypeRepository;
    private final CarRepository carRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    @Transactional
    public MediaFile uploadMediaFile(UUID carTypeId, MultipartFile file, String description, Integer displayOrder) {
        CarType carType = carTypeRepository.findById(carTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + carTypeId));

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Create car type specific directory
            Path carTypeDir = uploadPath.resolve("car-types").resolve(carTypeId.toString());
            if (!Files.exists(carTypeDir)) {
                Files.createDirectories(carTypeDir);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file to local storage
            Path filePath = carTypeDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create relative URL for accessing the file
            String fileUrl = "/uploads/car-types/" + carTypeId + "/" + uniqueFilename;

            MediaFile mediaFile = MediaFile.builder()
                    .fileName(originalFilename)
                    .fileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .description(description)
                    .displayOrder(displayOrder != null ? displayOrder : 0)
                    .mediaCategory(MediaCategory.CAR_TYPE_IMAGE)
                    .carType(carType)
                    .car(null)
                    .build();

            return mediaFileRepository.save(mediaFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public MediaFile getMediaFileById(UUID id) {
        return mediaFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + id));
    }

    @Override
    public List<MediaFile> getMediaFilesByCarType(UUID carTypeId) {
        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }
        return mediaFileRepository.findByCarTypeIdAndMediaCategoryOrderByDisplayOrderAsc(
                carTypeId,
                MediaCategory.CAR_TYPE_IMAGE
        );
    }

    @Override
    @Transactional
    public MediaFile uploadCarDamageMediaFile(UUID carId, MultipartFile file, String description, Integer displayOrder) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("Car not found: " + carId));

        return uploadCarDamageMediaFileInternal(
            car,
            file,
            description,
            displayOrder,
            DamageSource.LEGACY_OR_MANUAL,
            null
        );
        }

        @Override
        @Transactional
        public MediaFile uploadPostTripDamageMediaFile(UUID carId, UUID sourceBookingId, MultipartFile file, String description, Integer displayOrder) {
        if (sourceBookingId == null) {
            throw new IllegalArgumentException("sourceBookingId is required for post-trip uploads");
        }

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new IllegalArgumentException("Car not found: " + carId));

        return uploadCarDamageMediaFileInternal(
            car,
            file,
            description,
            displayOrder,
            DamageSource.POST_TRIP_INSPECTION,
            sourceBookingId
        );
        }

        private MediaFile uploadCarDamageMediaFileInternal(
            Car car,
            MultipartFile file,
            String description,
            Integer displayOrder,
            DamageSource damageSource,
            UUID sourceBookingId
        ) {
            UUID carId = car.getId();

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed for car damage uploads");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path carDamageDir = uploadPath.resolve("cars").resolve(carId.toString()).resolve("damages");
            if (!Files.exists(carDamageDir)) {
                Files.createDirectories(carDamageDir);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            Path filePath = carDamageDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/cars/" + carId + "/damages/" + uniqueFilename;

            MediaFile mediaFile = MediaFile.builder()
                    .fileName(originalFilename)
                    .fileUrl(fileUrl)
                    .fileType(contentType)
                    .fileSize(file.getSize())
                    .description(description)
                    .displayOrder(displayOrder != null ? displayOrder : 0)
                    .mediaCategory(MediaCategory.CAR_DAMAGE_IMAGE)
                    .damageSource(damageSource)
                    .sourceBookingId(sourceBookingId)
                    .carType(car.getCarType())
                    .car(car)
                    .build();

            return mediaFileRepository.save(mediaFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<MediaFile> getCarDamageMediaFiles(UUID carId) {
        if (!carRepository.existsById(carId)) {
            throw new IllegalArgumentException("Car not found: " + carId);
        }
        return mediaFileRepository.findByCarIdAndMediaCategoryOrderByDisplayOrderAsc(carId, MediaCategory.CAR_DAMAGE_IMAGE);
    }

    @Override
    public List<MediaFile> getPostTripDamageMediaFilesByBooking(UUID sourceBookingId) {
        if (sourceBookingId == null) {
            throw new IllegalArgumentException("sourceBookingId is required");
        }
        return mediaFileRepository.findBySourceBookingIdAndDamageSourceAndMediaCategory(
                sourceBookingId,
                DamageSource.POST_TRIP_INSPECTION,
                MediaCategory.CAR_DAMAGE_IMAGE
        );
    }

    @Override
    @Transactional
    public void deleteCarDamageMediaFile(UUID carId, UUID mediaFileId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaFileId)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + mediaFileId));

        if (mediaFile.getCar() == null || !mediaFile.getCar().getId().equals(carId)) {
            throw new IllegalArgumentException("Damage image does not belong to car: " + carId);
        }

        if (mediaFile.getMediaCategory() != MediaCategory.CAR_DAMAGE_IMAGE) {
            throw new IllegalArgumentException("Media file is not a car damage image: " + mediaFileId);
        }

        deletePhysicalFile(mediaFile.getFileUrl());
        mediaFileRepository.deleteById(mediaFileId);
    }

    @Override
    @Transactional
    public MediaFile updateMediaFile(UUID id, String description, Integer displayOrder) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + id));

        if (description != null) {
            mediaFile.setDescription(description);
        }
        if (displayOrder != null) {
            mediaFile.setDisplayOrder(displayOrder);
        }

        return mediaFileRepository.save(mediaFile);
    }

    @Override
    @Transactional
    public void deleteMediaFile(UUID id) {
        MediaFile mediaFile = mediaFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media file not found: " + id));
        
        // Delete physical file
        deletePhysicalFile(mediaFile.getFileUrl());
        
        // Delete database record
        mediaFileRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteMediaFilesByCarType(UUID carTypeId) {
        if (!carTypeRepository.existsById(carTypeId)) {
            throw new IllegalArgumentException("Car type not found: " + carTypeId);
        }
        
        // Get all media files for this car type
        List<MediaFile> mediaFiles = mediaFileRepository.findByCarTypeIdAndMediaCategoryOrderByDisplayOrderAsc(
            carTypeId,
            MediaCategory.CAR_TYPE_IMAGE
        );
        
        // Delete physical files
        mediaFiles.forEach(mediaFile -> deletePhysicalFile(mediaFile.getFileUrl()));
        
        // Delete database records
        mediaFileRepository.deleteByCarTypeIdAndMediaCategory(carTypeId, MediaCategory.CAR_TYPE_IMAGE);
    }

    @Override
    @Transactional
    public void deleteMediaFilesByCar(UUID carId) {
        List<MediaFile> mediaFiles = mediaFileRepository.findByCarId(carId);
        mediaFiles.forEach(mediaFile -> deletePhysicalFile(mediaFile.getFileUrl()));
        mediaFileRepository.deleteAll(mediaFiles);
    }

    @Override
    @Transactional
    public void deletePostTripDamageMediaFilesNotIn(UUID sourceBookingId, List<UUID> retainedMediaIds) {
        if (sourceBookingId == null) {
            throw new IllegalArgumentException("sourceBookingId is required");
        }

        Set<UUID> retainedSet = retainedMediaIds == null
                ? Set.of()
                : new LinkedHashSet<>(retainedMediaIds);

        List<MediaFile> postTripFiles = getPostTripDamageMediaFilesByBooking(sourceBookingId);
        postTripFiles.stream()
                .filter(mediaFile -> !retainedSet.contains(mediaFile.getId()))
                .forEach(mediaFile -> {
                    deletePhysicalFile(mediaFile.getFileUrl());
                    mediaFileRepository.deleteById(mediaFile.getId());
                });
    }
    
    /**
     * Delete physical file from local storage
     */
    private void deletePhysicalFile(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
                // Convert URL to file path
                String relativePath = fileUrl.substring(1); // Remove leading slash
                Path filePath = Paths.get(relativePath);
                
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
        } catch (IOException e) {
            // Log error but don't throw exception to allow database deletion to proceed
            System.err.println("Failed to delete physical file: " + fileUrl + " - " + e.getMessage());
        }
    }
}
