package main.repositories;

import main.entities.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MediaFileRepository extends
        JpaRepository<MediaFile, UUID>,
        JpaSpecificationExecutor<MediaFile> {

    List<MediaFile> findByCarTypeIdOrderByDisplayOrderAsc(UUID carTypeId);

    void deleteByCarTypeId(UUID carTypeId);
}
