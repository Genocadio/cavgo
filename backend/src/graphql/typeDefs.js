const { gql } = require('apollo-server-express');

// User-related types
const userTypes = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String!
    userType: String!
    company: Company  # Add this line
  }

  type AuthPayload {
    token: String!
    user: User
  }

  type UserResponse {
    success: Boolean!
    message: String
    data: User
  }

  type UsersResponse {
    success: Boolean!
    message: String
    data: [User!]!
  }

  type AuthResponse {
    success: Boolean!
    message: String
    data: AuthPayload
  }

  type Query {
    getUsers: UsersResponse!
    getUser(id: ID): UserResponse!
  }
  
  type ChangePasswordResponse {
  success: Boolean!
  message: String!
}

  type Mutation {
    registerUser(
      firstName: String!,
      lastName: String!,
      email: String!,
      phoneNumber: String!,
      password: String!,
      userType: String = "customer",
      companyId: ID  # Optional field
    ): AuthResponse!

    loginUser(email: String!, password: String!): AuthResponse!

  updateUser(
    id: ID, # Optional field
    firstName: String, 
    lastName: String, 
    email: String, 
    phoneNumber: String, 
    userType: String, 
    companyId: ID # Optional field
  ): UserResponse!

    deleteUser(id: ID!): UserResponse!

  changePassword(
    currentPassword: String, 
    newPassword: String!, 
    userId: ID
  ): ChangePasswordResponse!
  }
`;




// Driver-related types
const driverTypes = gql`
  type Driver {
    id: ID!
    name: String!
    email: String!
    phoneNumber: String!
    type: String!
    license: String!
    company: Company
    createdAt: String!
  }

  type DriverAuthPayload {
    success: Boolean!
    message: String
    token: String
    driver: Driver
  }

  type DriverResponse {
    success: Boolean!
    message: String
    data: Driver
  }

  type Query {
    getDriver(id: ID!): DriverResponse
    getDrivers: DriverResponse
  }

  type Mutation {
    registerDriver(
      name: String!,
      email: String!,
      phoneNumber: String!,
      type: String!,
      license: String!,
      companyId: ID,
      password: String!
    ): DriverAuthPayload!

    loginDriver(email: String!, password: String!): DriverAuthPayload!

    updateDriver(
      id: ID!,
      name: String,
      email: String,
      phoneNumber: String,
      type: String,
      license: String,
      companyId: ID
    ): DriverResponse!

    deleteDriver(id: ID!): DriverResponse!
  }
`;

// Company-related types
const companyTypes = gql`
  type Company {
    id: ID!
    name: String!
    location: String!
    email: String!
    createdAt: String # Assuming ISO 8601 string
  }

  type CompanyResponse {
    success: Boolean!
    message: String
    data: Company # Single company
  }

  type CompaniesResponse {
    success: Boolean!
    message: String
    data: [Company] # Non-nullable array of non-nullable Company objects
  }

  type Query {
    getCompany(id: ID!): CompanyResponse
    getCompanies: CompaniesResponse
  }

  type Mutation {
    registerCompany(
      name: String!,
      location: String!,
      email: String!
    ): CompanyResponse!

    updateCompany(
      id: ID!,
      name: String,
      location: String,
      email: String
    ): CompanyResponse!

    deleteCompany(id: ID!): CompanyResponse!
  }
`;



// Car-related types
const carTypes = gql`
  type Car {
    id: ID!
    plateNumber: String!
    numberOfSeats: Int!
    ownerCompany: Company
    privateOwner: String
    driver: Driver
    isOccupied: Boolean!
    user: User!  # Added field for the User who added the car
    createdAt: String!
  }

  type CarResponse {
    success: Boolean!
    message: String
    data: Car
  }

  type CarListResponse {
    success: Boolean!
    message: String
    data: [Car!]
  }

  type Query {
    getCar(id: ID!): CarResponse!
    getCars: CarListResponse!
  }

  type Mutation {
    registerCar(
      plateNumber: String!,
      numberOfSeats: Int!,
      ownerCompanyId: ID,
      privateOwner: String,
      driverId: ID,
      isOccupied: Boolean,
      userId: ID  # Added userId field
    ): CarResponse!

    updateCar(
      id: ID!,
      plateNumber: String,
      numberOfSeats: Int,
      ownerCompanyId: ID,
      privateOwner: String,
      driverId: ID,
      isOccupied: Boolean
    ): CarResponse!

    deleteCar(id: ID!): CarResponse!
  }
`;


// Location-related types
const locationTypes = gql`
  type Location {
    id: ID!
    name: String!
    type: String!
    coordinates: Coordinates!
    address: String!
    googlePlaceId: String!
    createdAt: String!
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type LocationResponse {
    success: Boolean!
    message: String
    data: Location # Single Location for getLocation
  }

  type LocationsResponse {
    success: Boolean!
    message: String
    data: [Location] # Array of Locations for getLocations
  }

  type Query {
    getLocation(id: ID!): LocationResponse
    getLocations(type: String): LocationsResponse # Returns an array of Location objects
  }

  type Mutation {
    addLocation(
      name: String!,
      type: String!,
      coordinates: CoordinatesInput!,
      address: String!,
      googlePlaceId: String!
    ): LocationResponse!

    updateLocation(
      id: ID!,
      name: String,
      type: String,
      coordinates: CoordinatesInput,
      address: String,
      googlePlaceId: String
    ): LocationResponse!

    deleteLocation(id: ID!): LocationResponse!
  }

  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }
`;


// Route-related types
const routeTypes = gql`
  type Route {
    id: ID!
    origin: Location!
    destination: Location
    googleMapsRouteId: String!
    price: Float!
    createdAt: String!
  }

  type RouteResponse {
    success: Boolean!
    message: String
    data: Route
  }

  type RoutesData {
    data: [Route!]!
    success: Boolean!
    message: String
  }

  type Query {
    getRoute(id: ID!): RouteResponse
    getRoutes: RoutesData
  }

  type Mutation {
    addRoute(
      originId: ID!,
      destinationId: ID!,
      googleMapsRouteId: String!,
      price: Float!
    ): RouteResponse!

    deleteRoute(id: ID!): RouteResponse!
  }
`;

// Trip-related types

const tripTypes = gql`
type StopPointPrice {
  location: Location!  # The stop point (location)
  price: Float!        # Price to reach this stop point
}

type Trip {
  id: ID!
  route: Route!
  car: Car!
  boardingTime: String!
  status: String!
  user: User!  # User field is retained
  availableSeats: Int!  # Available seats
  stopPoints: [StopPointPrice]  # Array of stop points, each with its price
  reverseRoute: Boolean!  # Indicates if the route is reversible
  createdAt: String!
}

type TripResponse {
  success: Boolean!
  message: String
  data: Trip
}

type Query {
  getTrip(id: ID!): TripResponse
  getTrips: [TripResponse!]
}

type Mutation {
  addTrip(
    routeId: ID!,
    carId: ID!,
    boardingTime: String!,
    status: String,
    stopPoints: [StopPointPriceInput],  # Updated to just take stop points with price
    reverseRoute: Boolean
  ): TripResponse!

  deleteTrip(id: ID!): TripResponse!
}

input StopPointPriceInput {
  locationId: ID!  # Reference to the location
  price: Float!    # Price to reach this stop point
}
`;

const bookingsTypes = gql`
  type Booking {
    id: ID!
    user: User!
    trip: Trip!
    destination: String!
    numberOfTickets: Int!
    price: Float!
    createdAt: String! 
    status: String!
  }

  type BookingResponse {
    success: Boolean!
    message: String
    data: Booking
  }

  type BookingsResponse {
    success: Boolean!
    message: String
    data: [Booking!]! 
  }


  type DeleteBookingResponse {
    success: Boolean!
    message: String
    data: String
  }

  type Query {
    getBooking(id: ID!): BookingResponse!
    getBookingsByUser(userId: ID): BookingsResponse! 
    getBookings: BookingsResponse! 
  }

  type Mutation {
    addBooking(
      tripId: ID!,
      destination: String!,
      numberOfTickets: Int!,
      price: Float!
    ): BookingResponse!
     deleteBooking(id: ID!): DeleteBookingResponse!
    updateBookingStatus(
      id: ID!,
      status: String
    ): BookingResponse!
  }
`;

const paymentTypes = gql`
  type Payment {
    id: ID!
    booking: Booking!           
    amountPaid: Float! 
    paymentStatus: String!    
    car: Car!                   
    paymentDate: String
    name: String!         
    user: User!               
  }

  type PaymentResponse {
    success: Boolean!           
    message: String 
    data: Payment 
  }

  type PaymentsResponse {
    success: Boolean!           
    message: String 
    data: [Payment!]!      
  }

  type Query {
    getPayment(id: ID!): PaymentResponse!           
    getPaymentsByUser: PaymentsResponse!             
  }

  type Mutation {
    createPayment(
      bookingId: ID!,
      phoneNumber: String!,                          
    ): PaymentResponse!
  }
`;

// Basic Hello Query
const basicQueryTypes = gql`
  type Query {
    hello: String
  }
`;

const scheduleTypes = gql`
  type Schedule {
    id: ID!
    user: User!  # Reference to the User associated with the schedule
    origin: Location!  # Reference to the origin Location
    destination: Location!  # Reference to the destination Location
    time: String!  # Store time as a string for easier handling (ISO 8601 format)
    matchedRoutes: [Route]  # Array of matched Routes
    originType: String #
    destinationType: String
    status: String
    constructedRoutes: [Route]  # Array of constructed Routes
    createdAt: String!  # Timestamp for when the schedule was created
    updatedAt: String!  # Timestamp for when the schedule was last updated
  }

  type ScheduleResponse {
    success: Boolean!
    message: String
    data: Schedule
  }

  type SchedulesResponse {
    success: Boolean!
    message: String
    data: [Schedule!]!
  }

  type Query {
    getSchedule(id: ID!): ScheduleResponse!
    getSchedules: SchedulesResponse!
    getUserSchedules(userId: ID): SchedulesResponse!
  }

  type Mutation {
    createSchedule(
      originId: ID!,
      destinationId: ID!,
      time: String!
    ): ScheduleResponse!

    updateSchedule(
      id: ID!,
      originId: ID,
      destinationId: ID,
      time: String
    ): ScheduleResponse!

    deleteSchedule(id: ID!): ScheduleResponse!
  }
`;



// Combine all the types and export them
module.exports = {
  userTypes,
  driverTypes,
  companyTypes,
  carTypes,
  locationTypes,
  routeTypes,
  tripTypes,
  basicQueryTypes,
  bookingsTypes,
  paymentTypes,
  scheduleTypes,
};
