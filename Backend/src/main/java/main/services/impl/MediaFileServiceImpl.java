package main.services.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.entities.CarType;
import main.entities.MediaFile;
import main.repositories.CarTypeRepository;
import main.repositories.MediaFileRepository;
import main.services.MediaFileService;

@Service
@RequiredArgsConstructor
public class MediaFileServiceImpl implements MediaFileService {
    
    private final MediaFileRepository mediaFileRepository;
    private final CarTypeRepository carTypeRepository;
    
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
                    .carType(carType)
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
        return mediaFileRepository.findByCarTypeIdOrderByDisplayOrderAsc(carTypeId);
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
        List<MediaFile> mediaFiles = mediaFileRepository.findByCarTypeIdOrderByDisplayOrderAsc(carTypeId);
        
        // Delete physical files
        mediaFiles.forEach(mediaFile -> deletePhysicalFile(mediaFile.getFileUrl()));
        
        // Delete database records
        mediaFileRepository.deleteByCarTypeId(carTypeId);
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
