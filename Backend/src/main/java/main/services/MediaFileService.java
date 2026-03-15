package main.services;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import main.entities.MediaFile;

public interface MediaFileService {
    
    MediaFile uploadMediaFile(UUID carTypeId, MultipartFile file, String description, Integer displayOrder);

    MediaFile getMediaFileById(UUID id);

    List<MediaFile> getMediaFilesByCarType(UUID carTypeId);

    MediaFile uploadCarDamageMediaFile(UUID carId, MultipartFile file, String description, Integer displayOrder);

    MediaFile uploadPostTripDamageMediaFile(UUID carId, UUID sourceBookingId, MultipartFile file, String description, Integer displayOrder);

    List<MediaFile> getCarDamageMediaFiles(UUID carId);

    List<MediaFile> getPostTripDamageMediaFilesByBooking(UUID sourceBookingId);

    void deleteCarDamageMediaFile(UUID carId, UUID mediaFileId);

    MediaFile updateMediaFile(UUID id, String description, Integer displayOrder);

    void deleteMediaFile(UUID id);

    void deleteMediaFilesByCarType(UUID carTypeId);

    void deleteMediaFilesByCar(UUID carId);

    void deletePostTripDamageMediaFilesNotIn(UUID sourceBookingId, List<UUID> retainedMediaIds);
}
