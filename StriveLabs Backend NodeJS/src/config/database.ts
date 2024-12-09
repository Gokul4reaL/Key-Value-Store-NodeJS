import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('mysql://root:root@localhost:3306/kvstore', {
    logging: console.log, // Log all SQL queries
});

export default sequelize;
