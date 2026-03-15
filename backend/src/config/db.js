const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    // Add this section below:
    dialectOptions: {
      ssl: {
        require: true, 
        rejectUnauthorized: false // Required for Render and many other cloud hosts
      }
    }
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('Unable to connect to PostgreSQL:', err);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
