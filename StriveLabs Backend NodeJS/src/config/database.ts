import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('kvstore', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log, // Log all SQL queries
});

export default sequelize;
