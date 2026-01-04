import mongoose from "mongoose";
import { User } from "../models/User";
import { Car } from "../models/Car";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await User.createIndexes();
    await Car.createIndexes();

    const adminExists = await User.findOne({ role: "admin" });
    let adminUser;

    if (!adminExists) {
      adminUser = new User({
        email: "admin@example.com",
        password: "adminadmin",
        name: "Admin User",
        role: "admin",
      });

      await adminUser.save();
      console.log("Admin user created successfully");
    } else {
      adminUser = adminExists;
    }

    const car = await Car.findOne({ brand: "Toyota" });
    if (!car && adminUser) {
      console.log("Creating sample car");
      const mockCar = {
        brand: "Toyota",
        carModel: "Corolla",
        year: 2020,
        price: 15000,
        mileage: 25000,
        fuelType: "petrol",
        transmission: "automatic",
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg/960px-2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg",
          "https://c8.alamy.com/comp/2J2W6T2/2019-red-toyota-corolla-vvt-1-excel-hev-c-driving-on-the-m61-motorway-manchester-uk-2J2W6T2.jpg",
        ],
        description:
          "A reliable and fuel-efficient sedan, perfect for city driving.",
        features: ["Bluetooth", "Backup Camera", "Cruise Control"],
        location: {
          city: "Sofia",
          state: "",
          country: "Bulgaria",
        },
        seller: adminUser._id,
      };

      await new Car(mockCar).save();
    }

    console.log("Database initialization completed");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
