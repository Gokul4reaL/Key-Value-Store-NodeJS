import express from 'express';
import sequelize from './config/database';
import kvStoreRoutes from './routes/kvStoreRoutes';
import cleanupExpiredKeys from './services/cleanupService';

const app = express();
const port = 3000;

app.use(express.json());
app.use(kvStoreRoutes);

sequelize.sync({ force: true })
  .then(() => {
    console.log('Database & tables created!');
    cleanupExpiredKeys();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
