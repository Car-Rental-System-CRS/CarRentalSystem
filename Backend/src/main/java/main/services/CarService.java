package main.services;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.dtos.response.MediaFileResponse;
import main.entities.Car;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CarService {
    CarResponse createCar(CreateCarRequest request);

    CarResponse getCarById(UUID id);

    Page<CarResponse> getAllCars(
            Pageable pageable,
            Specification<Car> specification
    );

    CarResponse updateCar(UUID id, CreateCarRequest request);

    List<MediaFileResponse> addDamageImages(UUID carId, MultipartFile[] images, String[] imageDescriptions);

    void removeDamageImage(UUID carId, UUID imageId);

    void deleteCar(UUID id);
}
