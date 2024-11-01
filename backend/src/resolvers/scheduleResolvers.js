// resolvers/scheduleResolvers.js
const Schedule = require('../models/Schedule');
const User = require('../models/User'); // Assuming you have a User model
const findDedicatedRoute = require('../helpers/findRoutes')
const Location = require('../models/Location');
const Route = require('../models/Route');

const scheduleResolvers = {
  Query: {
    getSchedule: async (_, { id }) => {
      try {
        const schedule = await Schedule.findById(id).populate('user origin destination matchedRoutes constructedRoutes');
        if (!schedule) {
          return {
            success: false,
            message: 'Schedule not found',
            data: null,
          };
        }
        return {
          success: true,
          message: 'Schedule retrieved successfully',
          data: schedule,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    getSchedules: async () => {
      try {
        const schedules = await Schedule.find().populate('user origin destination matchedRoutes constructedRoutes');
        return {
          success: true,
          message: 'Schedules retrieved successfully',
          data: schedules,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },
    getUserSchedules: async (_, { userId }, context) => {
        try {
          // Ensure user is authenticated
          const loggedInUser = context.user;
          if (!loggedInUser) {
            return {
              success: false,
              message: 'User not authenticated',
              data: null,
            };
          }
  
          // Determine the query criteria
          const query = userId && loggedInUser.userType === 'admin' 
            ? { user: userId } 
            : { user: loggedInUser.id };
  
            const schedules = await Schedule.find(query)
      .populate('origin')
      .populate('destination')
      .populate({
        path: 'matchedRoutes',
        populate: { path: 'origin destination' },
      });
          
          return {
            success: true,
            message: 'User schedules retrieved successfully',
            data: schedules,
          };
        } catch (error) {
          return {
            success: false,
            message: error.message,
            data: null,
          };
        }
      },
  },

  Mutation: {
    createSchedule: async (_, { originId, destinationId, time }, context) => {
      try {
        // Validate user
        const user = context.user;
        if (!user) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null
          };
        }
        const routeData = await findDedicatedRoute(originId, destinationId);
    

        // Create new schedule
        const newSchedule = new Schedule({
          user: user.id,
          origin: originId,
          destination: destinationId,
          time,
          originType: routeData.originType, // Modify this according to your logic
          destinationType: routeData.destinationType, // Modify this according to your logic
            matchedRoutes: routeData.routes, // Modify this according to your logic
        });
        console.log(routeData);
        console.log(newSchedule)
        

        const savedSchedule = await newSchedule.save();
        return {
          success: true,
          message: 'Schedule created successfully',
          data: savedSchedule,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    updateSchedule: async (_, { id, originId, destinationId, time }, context) => {
      try {
        const user = context.user;
        if (!user) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null
          };
        }
    
        const schedule = await Schedule.findById(id);
        if (!schedule) {
          return {
            success: false,
            message: 'Schedule not found',
            data: null,
          };
        }

        // Update schedule fields
        schedule.user =  schedule.user;
        schedule.origin = originId || schedule.origin;
        schedule.destination = destinationId || schedule.destination;
        schedule.time = time || schedule.time;

        const updatedSchedule = await schedule.save();
        return {
          success: true,
          message: 'Schedule updated successfully',
          data: updatedSchedule,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },

    deleteSchedule: async (_, { id }) => {
      try {
        const schedule = await Schedule.findByIdAndDelete(id);
        if (!schedule) {
          return {
            success: false,
            message: 'Schedule not found',
            data: null,
          };
        }
        return {
          success: true,
          message: 'Schedule deleted successfully',
          data: schedule,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
    },
  },
  Schedule: {
    user: async (schedule) => {
      try {
        if (schedule.user) {
          return await User.findById(schedule.user);
        }
        return null;
      } catch (err) {
        console.error('Error in user resolver:', err);
        return null;
      }
    },

    origin: async (schedule) => {
      try {
        console.log('origin', schedule.origin);

        if (schedule.origin) {
            
          return await Location.findById(schedule.origin);
        }
        return null;
      } catch (err) {
        console.error('Error in origin resolver:', err);
        return null;
      }
    },

    destination: async (schedule) => {
      try {
        console.log('origin $$', schedule.destination);
        if (schedule.destination) {
          return await Location.findById(schedule.destination);
        }
        return null;
      } catch (err) {
        console.error('Error in destination resolver:', err);
        return null;
      }
    },

    matchedRoutes: async (schedule) => {
      try {
        if (schedule.matchedRoutes && schedule.matchedRoutes.length > 0) {
          return await Route.find({ _id: { $in: schedule.matchedRoutes } });
        }
        return [];
      } catch (err) {
        console.error('Error in matchedRoutes resolver:', err);
        return [];
      }
    },

    constructedRoutes: async (schedule) => {
      try {
        if (schedule.constructedRoutes && schedule.constructedRoutes.length > 0) {
          return await Route.find({ _id: { $in: schedule.constructedRoutes } });
        }
        return [];
      } catch (err) {
        console.error('Error in constructedRoutes resolver:', err);
        return [];
      }
    },
  },
};

module.exports = scheduleResolvers;
