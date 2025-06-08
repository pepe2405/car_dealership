import mongoose from 'mongoose';
import { User } from '../models/User';
import { Car } from '../models/Car';

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create indexes
    await User.createIndexes();
    await Car.createIndexes();

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    let adminUser; 

    if (!adminExists) {
      // Create admin user
      adminUser = new User({
        email: 'admin@example.com',
        password: 'admin123', // This will be hashed by the pre-save hook
        name: 'Admin User',
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      adminUser = adminExists;
    }

    const car = await Car.findOne({ brand: 'Toyota' });
    if (!car && adminUser) {
      // Create a sample car
      console.log('Creating sample car');
      const mockCar = {
        brand: "Toyota",
        carModel: "Corolla",
        year: 2020,
        price: 15000,
        mileage: 25000,
        fuelType: "petrol",
        transmission: "automatic",
        images: [
          "https://example.com/car1.jpg",
          "https://example.com/car2.jpg"
        ],
        description: "A reliable and fuel-efficient sedan, perfect for city driving.",
        features: ["Bluetooth", "Backup Camera", "Cruise Control"],
        location: {
          city: "Sofia",
          state: "",
          country: "Bulgaria"
        },
        seller: adminUser._id
      }

      await new Car(mockCar).save();
    }; 

    

      console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}; 