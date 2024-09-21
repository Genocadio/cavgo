const mongoose = require('mongoose');
const Company = require('../models/Company');

const companyResolvers = {
  Query: {
    getCompany: async (_, { id }) => {
      try {
        const company = await Company.findById(id);
        if (!company) {
          return {
            success: false,
            message: 'Company not found',
            data: null,
          };
        }
        return {
          success: true,
          message: 'Company retrieved successfully',
          data: company,
        };
      } catch (err) {
        console.error('Error retrieving company:', err);
        return {
          success: false,
          message: err.message || 'Error retrieving company',
          data: null,
        };
      }
    },

    getCompanies: async () => {
      console.log('Resolver function called');
      try {
        console.log('Fetching companies...');
        const companies = await Company.find(); // Fetch all companies from the database
        // console.log('Companies:', companies);
        
        // Ensure the returned data matches the expected schema
        return {
          success: true,
          message: 'Companies retrieved successfully',
          data: companies, // Return the array of companies
        };
      } catch (err) {
        console.error('Error retrieving companies:', err);
        return {
          success: false,
          message: err.message || 'Error retrieving companies',
          data: [], // Return an empty array in case of an error
        };
      }
    },
    
  },    

  Mutation: {
    registerCompany: async (_, { name, location, email }) => {
      try {
        const company = new Company({ name, location, email });
        await company.save();
        return {
          success: true,
          message: 'Company registered successfully',
          data: company,
        };
      } catch (err) {
        console.error('Error registering company:', err);
        return {
          success: false,
          message: err.message || 'Error registering company',
          data: null,
        };
      }
    },

    updateCompany: async (_, { id, name, location, email }) => {
      try {
        const company = await Company.findByIdAndUpdate(
          id,
          { name, location, email },
          { new: true }
        );
        if (!company) return { success: false, message: 'Company not found', data: null };
        return {
          success: true,
          message: 'Company updated successfully',
          data: company,
        };
      } catch (err) {
        console.error('Error updating company:', err);
        return {
          success: false,
          message: err.message || 'Error updating company',
          data: null,
        };
      }
    },

    deleteCompany: async (_, { id }) => {
      try {
        const company = await Company.findByIdAndDelete(id);
        if (!company) return { success: false, message: 'Company not found', data: null };
        return {
          success: true,
          message: 'Company deleted successfully',
          data: company,
        };
      } catch (err) {
        console.error('Error deleting company:', err);
        return {
          success: false,
          message: err.message || 'Error deleting company',
          data: null,
        };
      }
    },
  },
};

module.exports = companyResolvers;
