
package src.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String make;
    private String model;
    private int seats;

    public Vehicle() {}

    public Vehicle(String make, String model, int seats) {
        this.make = make;
        this.model = model;
        this.seats = seats;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getSeats() { return seats; }
    public void setSeats(int seats) { this.seats = seats; }
}
