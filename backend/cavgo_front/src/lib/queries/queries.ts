import { gql } from '@apollo/client';

// Query to fetch all companies
export const GET_COMPANIES = gql`
  query GetCompanies {
    getCompanies {
      success
      message
      data {
        id
        name
      }
    }
  }
`;
export const GET_LOCATIONS = gql`
query GetLocations($type: String) {
  getLocations(type: $type) {
    message
    data {
      type
      address
      coordinates {
        lng
        lat
      }
      name
      id
      googlePlaceId
      createdAt
    }
    success
  }
}
`;

export const GET_ROUTES = gql`
  query {
    getRoutes {
      data {
        id
        createdAt
        googleMapsRouteId
        price
        origin {
          id
          name
          type
          address
          googlePlaceId
          coordinates {
            lat
            lng
          }
          createdAt
        }
        destination {
          id
          name
          type
          address
          googlePlaceId
          coordinates {
            lat
            lng
          }
          createdAt
        }
      }
      message
      success
    }
  }
`;


// Query to get all locations

export const GET_CARS_QUERY = gql`
  query GetCars {
    getCars {
      success
      message
      data {
        id
        plateNumber
        numberOfSeats
        isOccupied
              ownerCompany {
        name
      }
      }
    }
  }
`;