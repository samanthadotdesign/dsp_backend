import { resolve } from 'path';
import db from './db/models/index.mjs';
import initDashboardController from './controllers/dashboards.mjs';
import initSkillController from './controllers/skills.mjs';
import initUserController from './controllers/users.mjs';
import initResourceController from './controllers/resources.mjs';

export default function bindRoutes(app) {
  const DashboardController = initDashboardController(db);

  app.get('/', (request, response) => {
    response.sendFile(resolve('dist', 'main.html'));
  });

  const SkillController = initSkillController(db);
  const UserController = initUserController(db);
  const ResourceController = initResourceController(db);

  app.get('/data/:id', DashboardController.index);
  app.post('/skill/:skillId', SkillController.index);

  app.post('/signup', UserController.signup);
  app.post('/login', UserController.login);
  app.post('/logout', UserController.logout);

  app.post('/add-resource', ResourceController.index);
}
