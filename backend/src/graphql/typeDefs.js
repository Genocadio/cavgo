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
    cards: [Card]  # Add cards as an array of references to Card model
    defaultCard: Card 
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
  updateDefaultCard(nfcId: String): UserResponse!
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
    license: String
    company: Company
    car: Car
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
  
  type DriversResponse {
  success: Boolean!
  message: String
  data: [Driver!]!
}

  type Query {
    getDriver(id: ID): DriverResponse
    getDrivers: DriversResponse
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
      id: ID,
      name: String,
      email: String,
      phoneNumber: String,
      type: String,
      license: String,
      companyId: ID
      car: ID
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
    location: Location  # The stop point (location)
    price: Float        # Price to reach this stop point
  }

  type Trip {
    id: ID!
    route: Route!
    car: Car!
    boardingTime: String!
    status: String!
    user: User!           # User field is retained
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

  type TripsResponse {
    success: Boolean!
    message: String
    data: [Trip]
  }

  type Query {
    getTrip(id: ID!): TripResponse
    getTrips: TripsResponse!                # Updated to return a single response with multiple trips
    getTripsByDriver(driverId: ID): TripsResponse!  # Returns trips by a specific driver, wrapped in a single response
  }

  type Mutation {
    addTrip(
      routeId: ID!,
      carId: ID!,
      boardingTime: String!,
      status: String,
      stopPoints: [StopPointPriceInput],  # Updated to take stop points with price
      reverseRoute: Boolean
    ): TripResponse!

    deleteTrip(id: ID!): TripResponse!
    updateTrip(
      id: ID!,
      routeId: ID,
      carId: ID,
      boardingTime: String,
      status: String,
      availableSeats: Int,
      stopPoints: [StopPointPriceInput],  # Optional array of stop points to update
      reverseRoute: Boolean
    ): TripResponse!
  }

  input StopPointPriceInput {
    locationId: ID  # Reference to the location
    price: Float    # Price to reach this stop point
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
    card: Card
    createdAt: String! 
    status: String!
    ticket: Ticket  # Optional ticket field
    pos: PosMachine
  }

  type Ticket {
    id: ID!
    booking: Booking!
    user: User!
    trip: Trip!
    qrCodeData: String!
    nfcId: String!
    validFrom: String!
    validUntil: String!
  }

  type BookingResponse {
    success: Boolean!
    message: String
    data: Booking
  }

  type BookingsResponse {
    success: Boolean!
    message: String
    data: [Booking!]
  }

  type DeleteBookingResponse {
    success: Boolean!
    message: String
    data: String
  }

  type Query {
    getBooking(id: ID!): BookingResponse!
    getBookingsByUser(userId: ID): BookingsResponse! 
    getBookings(tripId: ID): BookingsResponse! 
  }

  type Mutation {
    addBooking(
      tripId: ID!,
      destination: String!,
      numberOfTickets: Int!,
      price: Float!
      nfcId: String
    ): BookingResponse!
    deleteBooking(id: ID!): DeleteBookingResponse!
    updateBookingStatus(
      id: ID!,
      status: String
    ): BookingResponse!
  }
  
  type Subscription {
    bookingAdded(tripId: ID!): Booking!
    bookingUpdated: Booking!
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
      time: String,
      status: String
    ): ScheduleResponse!

    deleteSchedule(id: ID!): ScheduleResponse!
  }
`;

const tripPresttypes = gql`
  # Scalar type definitions
  scalar DateTime

  # StopPointPrice type for stop points in both Trip and TripPreset
  type StopPointPrice {
    location: Location!  # The stop point (location)
    price: Float!        # Price to reach this stop point
  }

  # TripPreset type
  type TripPreset {
    id: ID!
    route: Route!
    stopPoints: [StopPointPrice!]!
    reverseRoute: Boolean!
    presetName: String!
    user: User!
    company: Company!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Response types
  type TripPresetResponse {
    success: Boolean!
    message: String
    data: TripPreset
  }

  type TripPresetListResponse {
    success: Boolean!
    message: String
    data: [TripPreset!]
  }

  # Input types
  input StopPointPriceInput {
    locationId: ID!  # Reference to the location
    price: Float!    # Price to reach this stop point
  }


  input UpdateTripPresetInput {
    routeId: ID
    stopPoints: [StopPointPriceInput!]
    reverseRoute: Boolean
    presetName: String
  }

  # Query type
  type Query {
    getTripPreset(id: ID!): TripPresetResponse!
    getTripPresets: TripPresetListResponse!
  }

  # Mutation type
  type Mutation {
    addTripPreset(
     routeId: ID!
     stopPoints: [StopPointPriceInput!]
     reverseRoute: Boolean
     presetName: String! ): TripPresetResponse!
    updateTripPreset(id: ID!, input: UpdateTripPresetInput!): TripPresetResponse!
    deleteTripPreset(id: ID!): TripPresetResponse!
  }
`;

const posMachineTypes = gql`
  type PosMachine {
    id: ID!
    serialNumber: String!
    status: String!
    linkedCar: Car
    assignedDate: String
    lastActivityDate: String
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type PosMachineResponse {
    success: Boolean!
    message: String
    data: PosMachine
    token: String
    refreshToken: String
  }

  type PosMachineListResponse {
    success: Boolean!
    message: String
    data: [PosMachine!]
  }

  type Query {
    getPosMachine(id: ID!): PosMachineResponse!
    getPosMachines: PosMachineListResponse!
  }

  type Mutation {
    registerPosMachine(
      serialNumber: String!,
      carPlate: String!,
      password: String!,
    ): PosMachineResponse!

    updatePosMachine(
      serialNumber: String,
      status: String,
      plateNumber: String,
    ): PosMachineResponse!

    deletePosMachine(id: ID!): PosMachineResponse!
    regeneratePosToken(refreshToken: String!): PosMachineResponse!
    
  }
`;

const cardTypes = gql`
  type Card {
    id: ID!
    nfcId: String!
    user: User
    creator: User!
    createdAt: String!
    cardId: String!
    active: Boolean!
    wallet: Wallet
  }

  type CardResponse {
    success: Boolean!
    message: String
    data: Card
  }

  type CardsResponse {
    success: Boolean!
    message: String
    data: [Card!]!
  }

  type Query {
    # Fetch all cards (admin only)
    getCards: CardsResponse!

    # Fetch a single card by its ID
    getCard(nfcId: ID!): CardResponse!
  }

  type Mutation {
    # Create a new card
    createCard(
      nfcId: String!,
      email: String,
      phone: String,
      firstName: String,
      lastName: String
    ): CardResponse!

    # Update an existing card
    updateCard(
      id: ID!,
      nfcId: String,
      userId: ID
    ): CardResponse!

    # Delete a card
    deleteCard(id: ID!): CardResponse!
  }
`;


const walletTypes = gql`
  # Scalar type definitions
  scalar DateTime

  # WalletTransaction type for individual transactions in the wallet
  type WalletTransaction {
    type: String!          # Type of transaction: 'credit' or 'debit'
    amount: Float!         # Amount of the transaction
    description: String    # Description of the transaction (optional)
    date: DateTime!        # Timestamp of the transaction
  }

  # Wallet type definition
  type Wallet {
    id: ID!
    user: User!            # Linked user for the wallet
    card: Card !            # Optional: Linked card for the wallet
    balance: Float!        # Current balance in the wallet
    transactions: [WalletTransaction!]! # List of transactions in the wallet
    createdAt: DateTime!   # Wallet creation timestamp
    updatedAt: DateTime!   # Wallet last updated timestamp
  }

  # Response types
  type WalletResponse {
    success: Boolean!
    message: String
    data: Wallet
  }

  type WalletListResponse {
    success: Boolean!
    message: String
    data: [Wallet!]
  }

  # Input types
  input WalletTransactionInput {
    type: String!          # Type of transaction: 'credit' or 'debit'
    amount: Float!         # Amount of the transaction
    description: String    # Optional: Description of the transaction
  }

  # Query type
  type Query {
    getWallet(id: ID!): WalletResponse!      # Fetch a wallet by its ID
    getWallets: WalletListResponse!          # Fetch all wallets (admin-only)
  }

  # Mutation type
  type Mutation {
    createWallet(userId: ID, nfcId: ID): WalletResponse! # Create a new wallet
    updateWallet(
      nfcId: ID!,
      transaction: WalletTransactionInput!
    ): WalletResponse!                                    # Update wallet balance
    deleteWallet(id: ID!): WalletResponse!               # Delete a wallet by ID
  }
`;


const AgentsTypes = gql `

type AgentWallet {
  balance: Float!
  transactions: [WalletTransaction!]!
}

type Agent {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  phoneNumber: String!
  status: String!
  wallet: AgentWallet!
  createdAt: String!
  updatedAt: String!
}

type AgentPayload {
  success: Boolean!
  token: String
  agent: Agent
  message: String
}

type agentWalletResponse {
  success: Boolean!
  message: String
  data: AgentWallet

}
type getAgentResponse {
  success: Boolean!
  message: String
  data: Agent
}

type getAgentsResponse {
  success: Boolean!
  message: String
  data: [Agent]
}

type Query {
  getAgent(id: ID!): getAgentResponse!
  getAgents: getAgentsResponse!
  getAgentWallet(id: ID!): AuthPayload!
}

type Mutation {
  registerAgent(
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String!
    password: String!
  ): AgentPayload!

  loginAgent(email: String!, password: String!): AgentPayload!

  updateAgent(
    id: ID!
    firstName: String
    lastName: String
    email: String
    phoneNumber: String
  ): AgentPayload!

  deleteAgent(id: ID!): AuthPayload!

  addTransaction(
    id: ID!
    type: String!
    amount: Float!
    description: String
  ): AgentPayload!
}

type SuccessResponse {
  success: Boolean!
  message: String
}

`


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
  tripPresttypes,
  posMachineTypes,
  cardTypes,
  walletTypes,
  AgentsTypes
};
