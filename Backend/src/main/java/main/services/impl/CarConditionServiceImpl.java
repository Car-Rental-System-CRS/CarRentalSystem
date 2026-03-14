package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.CarConditionResponse;
import main.dtos.response.MediaFileResponse;
import main.repositories.CarConditionRepository;
import main.services.CarConditionService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarConditionServiceImpl implements CarConditionService {

    private final CarConditionRepository carConditionRepository;

    @Override
    public List<CarConditionResponse> getByBookingId(UUID bookingId) {
        return carConditionRepository.findByBookingId(bookingId).stream()
                .map(condition -> {
                    CarConditionResponse response = new CarConditionResponse();
                    response.setId(condition.getId());
                    response.setCarId(condition.getCar().getId());
                    response.setCarName(condition.getCar().getCarType().getName());
                    response.setOdometer(condition.getOdometer());
                    response.setFuelLevel(condition.getFuelLevel());
                    response.setPhotos(condition.getPhotos().stream()
                            .map(photo -> {
                                MediaFileResponse mf = new MediaFileResponse();
                                mf.setId(photo.getId());
                                mf.setFileUrl(photo.getFileUrl());
                                mf.setFileName(photo.getFileName());
                                mf.setDisplayOrder(photo.getDisplayOrder());
                                mf.setDescription(photo.getDescription());
                                mf.setCreatedAt(photo.getCreatedAt());
                                return mf;
                            })
                            .toList());
                    return response;
                })
                .toList();
    }
}
