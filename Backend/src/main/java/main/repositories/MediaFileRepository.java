package main.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import main.entities.MediaFile;
import main.enums.DamageSource;
import main.enums.MediaCategory;

@Repository
public interface MediaFileRepository extends
        JpaRepository<MediaFile, UUID>,
        JpaSpecificationExecutor<MediaFile> {

    List<MediaFile> findByCarTypeIdOrderByDisplayOrderAsc(UUID carTypeId);

    List<MediaFile> findByCarTypeIdAndMediaCategoryOrderByDisplayOrderAsc(UUID carTypeId, MediaCategory mediaCategory);

    List<MediaFile> findByCarIdAndMediaCategoryOrderByDisplayOrderAsc(UUID carId, MediaCategory mediaCategory);

    List<MediaFile> findByCarId(UUID carId);

        List<MediaFile> findBySourceBookingIdAndDamageSourceAndMediaCategory(
            UUID sourceBookingId,
            DamageSource damageSource,
            MediaCategory mediaCategory
        );

    void deleteByCarTypeId(UUID carTypeId);

    void deleteByCarTypeIdAndMediaCategory(UUID carTypeId, MediaCategory mediaCategory);
}
