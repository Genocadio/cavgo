// src/lib/queries.ts
import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $firstName: String!,
    $lastName: String!,
    $email: String!,
    $phoneNumber: String!,
    $password: String!,
    $userType: String,
    $companyId: ID
  ) {
    registerUser(
      firstName: $firstName,
      lastName: $lastName,
      email: $email,
      phoneNumber: $phoneNumber,
      password: $password,
      userType: $userType,
      companyId: $companyId
    ) {
      success
      message
      data {
        token
        user {
          id
          firstName
          lastName
          email
          phoneNumber
          userType
        }
      }
    }
  }
`;
export const REGISTER_COMPANY = gql`
  mutation RegisterCompany($name: String!, $location: String!, $email: String!) {
    registerCompany(name: $name, location: $location, email: $email) {
      success
      message
    }
  }
`;

export const REGISTER_DRIVER = gql`
mutation RegisterDriver(
  $name: String!,
  $email: String!,
  $phoneNumber: String!,
  $type: String!,
  $license: String!,
  $companyId: ID,
  $password: String!
) {
  registerDriver(
    name: $name,
    email: $email,
    phoneNumber: $phoneNumber,
    type: $type,
    license: $license,
    companyId: $companyId,
    password: $password
  ) {
    success
    message
    token
    driver {
      id
      name
      email
      phoneNumber
      type
      license
      company {
        id
        name
      }
    }
  }
}
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      message
      data {
        token
        user {
          id
          firstName
          lastName
          email
          phoneNumber
          userType
          company {
            id
            name
          }
        }
      }
    }
  }
`;

export const REGISTER_CAR = gql`
  mutation RegisterCar(
    $plateNumber: String!,
    $numberOfSeats: Int!,
    $ownerCompanyId: ID,
    $privateOwner: String,
    $driverId: ID,
    $isOccupied: Boolean
  ) {
    registerCar(
      plateNumber: $plateNumber,
      numberOfSeats: $numberOfSeats,
      ownerCompanyId: $ownerCompanyId,
      privateOwner: $privateOwner,
      driverId: $driverId,
      isOccupied: $isOccupied
    ) {
      success
      message
    }
  }
`;

export const ADD_LOCATION = gql`
  mutation AddLocation(
    $name: String!,
    $type: String!,
    $coordinates: CoordinatesInput!,
    $address: String!,
    $googlePlaceId: String!
  ) {
    addLocation(
      name: $name,
      type: $type,
      coordinates: $coordinates,
      address: $address,
      googlePlaceId: $googlePlaceId
    ) {
      success
      message
      data {
        id
        name
        type
        coordinates {
          lat
          lng
        }
        address
        googlePlaceId
        createdAt
      }
    }
  }
`;
 export const DELETE_LOCATION = gql`
 mutation DeleteLocation($deleteLocationId: ID!) {
  deleteLocation(id: $deleteLocationId) {
    data {
      name
    }
    message
    success
  }
}
  `;

export const ADD_ROUTE = gql`
mutation AddRoute($originId: ID!, $destinationId: ID!, $googleMapsRouteId: String!, $price: Float!) {
  addRoute(originId: $originId, destinationId: $destinationId, googleMapsRouteId: $googleMapsRouteId, price: $price) {
    message
    success
    data {
      googleMapsRouteId
      id
      price
      createdAt
    }
  }
}`
export const ADD_TRIP = gql`
mutation AddTrip($routeId: ID!, $carId: ID!, $boardingTime: String!, $status: String!, $stopPoints: [StopPointPriceInput!]!, $reverseRoute: Boolean!) {
  addTrip(
    routeId: $routeId
    carId: $carId
    boardingTime: $boardingTime
    status: $status
    stopPoints: $stopPoints
    reverseRoute: $reverseRoute
  ) {
    success
    message
    data {
      id
      route {
        id
        googleMapsRouteId
        price
        origin {
          address
          coordinates {
            lat
            lng
          }
          createdAt
          googlePlaceId
          id
          name
          type
        }
        destination {
          address
          createdAt
          googlePlaceId
          id
          name
          type
          coordinates {
            lat
            lng
          }
        }
      }
      car {
        plateNumber
        ownerCompany {
          name
        }
        driver {
          name
        }
      }
      availableSeats
      status

      stopPoints {
        price
        location {
          address
          coordinates {
            lat
            lng
          }
          createdAt
          googlePlaceId
          id
          name
        }
      }
      boardingTime
      reverseRoute
    }
  }
}
`;


