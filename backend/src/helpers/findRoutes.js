// utils/routeUtils.js

const Route = require('../models/Route');
const Trip = require('../models/Trip');

async function findDedicatedRoute(origin, destination) {
  try {
    // Step 1: Find exact matches for routes
    const exactRoutes = await Route.find({
      origin: origin,
      destination: destination,
    });

    if (exactRoutes.length > 0) {
      return {
        routes: exactRoutes.map(route => route._id), // Return all matching route IDs
        originType: 'route',
        destinationType: 'route',
      }; // Return the IDs if exact matches are found
    }

    // Step 2: Find partial matches for routes
    const originMatches = await Route.find({ origin: origin });
    const destinationMatches = await Route.find({ destination: destination });

    // Step 3: Construct routes array if partial matches are found
    let routesArray = [];
    let originType = 'none';
    let destinationType = 'none';

    // Handle case where we have routes matching only the origin
    if (originMatches.length > 0) {
      originMatches.forEach(route => {
        routesArray.push(route._id); // Add all matching origin routes
      });
      originType = 'route'; // Set type for origin as route

      // Look for trips that have the destination in their stop points
      const tripsWithDestination = await Trip.find({
        'stopPoints.location': destination
      }).populate('route');

      if (tripsWithDestination.length > 0) {
        tripsWithDestination.forEach(trip => {
          routesArray.push(trip.route._id); // Add routes from trips matching destination
          destinationType = 'stopPoint'; // Set type for destination as stop point
        });
      }
    }

    // Handle case where we have routes matching only the destination
    if (destinationMatches.length > 0 && routesArray.length === 0) {
      destinationMatches.forEach(route => {
        routesArray.push(route._id); // Add all matching destination routes
      });
      destinationType = 'route'; // Set type for destination as route

      // Look for trips that have the origin in their stop points
      const tripsWithOrigin = await Trip.find({
        'stopPoints.location': origin
      }).populate('route');

      if (tripsWithOrigin.length > 0) {
        tripsWithOrigin.forEach(trip => {
          routesArray.unshift(trip.route._id); // Add routes from trips matching origin at the beginning
          originType = 'stopPoint'; // Set type for origin as stop point
        });
      }
    }

    // If there are no routes matching either origin or destination, check trips
    if (routesArray.length === 0) {
      // Check for trips matching the origin
      const tripsWithOrigin = await Trip.find({
        'stopPoints.location': origin
      }).populate('route');

      // Check for trips matching the destination
      const tripsWithDestination = await Trip.find({
        'stopPoints.location': destination
      }).populate('route');

      // Construct the route if we have both trip matches
      if (tripsWithOrigin.length > 0 && tripsWithDestination.length > 0) {
        tripsWithOrigin.forEach(trip => {
          routesArray.push(trip.route._id); // Route matching origin
          originType = 'stopPoint'; // Origin is from stop point
        });
        tripsWithDestination.forEach(trip => {
          routesArray.push(trip.route._id); // Route matching destination
          destinationType = 'stopPoint'; // Destination is from stop point
        });
      } else {
        if (tripsWithOrigin.length > 0) {
          originType = 'stopPoint'; // Set origin type if found in trip
        }
        if (tripsWithDestination.length > 0) {
          destinationType = 'stopPoint'; // Set destination type if found in trip
        }
      }
    }

    // Final check if no routes were found
    if (routesArray.length === 0) {
      // Self-invoke the function with swapped parameters
      return await findDedicatedRoute(destination, origin);
    }

    // Return the constructed array of route IDs and their types
    return {
      routes: routesArray,
      originType,
      destinationType,
    };

  } catch (error) {
    console.error('Error finding dedicated route:', error);
    throw new Error('Could not find a dedicated route');
  }
}

module.exports = findDedicatedRoute;
