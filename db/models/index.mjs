import { Sequelize } from 'sequelize';
import allConfig from '../../config/config.js';

// Initialize Models
import initUserModel from './user.mjs';
import initSectionModel from './section.mjs';
import initCategoryModel from './category.mjs';
import initSkillModel from './skill.mjs';
import initResourceModel from './resource.mjs';
import initUserSkillModel from './userSkill.mjs';

const env = process.env.NODE_ENV || 'development';

console.log('**** PROCESS ENV ****', env);

const config = allConfig[env];
console.log('**** CONFIG ****', config);

const db = {};
let sequelize;

if (env == 'production') {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config,
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Initializing the model here as a class
db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Section = initSectionModel(sequelize, Sequelize.DataTypes);
db.Category = initCategoryModel(sequelize, Sequelize.DataTypes);
db.Skill = initSkillModel(sequelize, Sequelize.DataTypes);
db.Resource = initResourceModel(sequelize, Sequelize.DataTypes);
db.UserSkill = initUserSkillModel(sequelize, Sequelize.DataTypes);

// Defining the relationship
// user_skills join table
// One skill has many users, one user can have many skills -> M-M relationship
// each of these (34, 35) allows me to call single-directional methods that apply to Instance
db.Skill.belongsToMany(db.User, { through: 'user_skills' });
db.User.belongsToMany(db.Skill, { through: 'user_skills' });

// user_resources join table
// M-M relationship
db.User.belongsToMany(db.Resource, { through: 'user_resources' });
db.Resource.belongsToMany(db.User, { through: 'user_resources' });

// Relationship between UserSkill and Skill
// One Skill has many UserSkills
db.Skill.hasMany(db.UserSkill);
db.UserSkill.belongsTo(db.Skill);

// user_categories join table
db.User.belongsToMany(db.Category, { through: 'user_categories' });
db.Category.belongsToMany(db.User, { through: 'user_categories' });

// One section can have many categories
db.Section.hasMany(db.Category);
db.Category.belongsTo(db.Section);

// One category can have many skills
db.Category.hasMany(db.Skill);
db.Skill.belongsTo(db.Category);

// One skill can have many resources
db.Skill.hasMany(db.Resource);
db.Resource.belongsTo(db.Skill);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
