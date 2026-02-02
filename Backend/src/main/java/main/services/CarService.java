package main.services;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public interface CarService {
    CarResponse createCar(CreateCarRequest request);

    CarResponse getCarById(UUID id);

    Page<CarResponse> getAllCars(
            Pageable pageable,
            Specification<Car> specification
    );

    CarResponse updateCar(UUID id, CreateCarRequest request);

    void deleteCar(UUID id);
}
