/**
 * Organizes resources into
 * @param resources is an array of objects
 * [ {id...resourceName ... resourceLink}, ...]
 * @returns object organized by skill
 * /* object = {  1: [ {name: ..., link: ...}. {name..., link ...}], ...}
 * */
const organizeResourcesInSkill = (resources) => {
  const result = {};
  for (let i = 0; i < resources.length; i += 1) {
    // Check if the skillId key exists in the object, add to array
    if (result[resources[i].skillId]) {
      result[resources[i].skillId].push({
        name: resources[i].resourceName,
        link: resources[i].resourceLink,
        // favicon: resources[i].favicon,
      });
    }
    // If the key doesn't exist, create an array + create the first object inside
    else {
      result[resources[i].skillId] = [{
        name: resources[i].resourceName,
        link: resources[i].resourceLink,
        // favicon: resourcesInSkill[i].favicon,
      }];
    }
  }
  return result;
};

/**
 * Get dashboard data for the particular user
 * @param db – Sequelize/Postgress database
 * @returns object { sections, ... }
 */
const getDashboardData = async (db, userId) => {
  let result;
  try {
    const sections = await db.Section.findAll();
    const categories = await db.Category.findAll();
    const skills = await db.Skill.findAll();

    // If there is a userId, get completed skillIds and categoryIds
    let skillIdsCompleted = [];
    let categoriesCompleted = []; // used for getting sticker data

    let resourcesInSkillObject = {};
    if (userId != 0) {
      const skillsCompleted = await db.UserSkill.findAll({
        where: {
          userId,
          completed: true,
        },
      });
      skillIdsCompleted = skillsCompleted.reduce(
        (accumulator, current) => [...accumulator, current.skillId], [],
      );

      // categoriesCompleted = [ { id: ... userId ... category_id: ... createdAt, updatedAt}, {} ]
      categoriesCompleted = await db.Category.findAll({
        include: {
          model: db.User,
          where: {
            id: userId,
          },
        },
      });

      // When user is logged in, get resources for particular user
      const user = await db.User.findByPk(userId);
      const resourcesInSkill = await user.getResources();
      // Create an object where the keys are the skillId for easy retrieval
      resourcesInSkillObject = organizeResourcesInSkill(resourcesInSkill);
    } else {
      // When user is not logged in, get the default skill values
      const defaultResources = await db.Resource.findAll({
        where: {
          isDefault: true,
        },
      });
      resourcesInSkillObject = organizeResourcesInSkill(defaultResources);
      skillIdsCompleted = [];
    }
    result = {
      sections,
      categories,
      skills,
      resources: resourcesInSkillObject,
      skillIdsCompleted,
      categoriesCompleted,
    };
  } catch (error) {
    console.log('Error getting dashboard data');
  }
  return result;
};

export default function initDashboardController(db) {
  // Get dashboard data
  // Use async/await here to getDashboardData
  const index = async (req, res) => {
    const { id: userId } = req.params;
    let dashboardData;

    // If user is logged in
    if (userId) {
      dashboardData = await getDashboardData(db, userId);
    }
    else {
      dashboardData = await getDashboardData(db, 0);
    }
    // Object that holds all the dashboard data
    res.send(dashboardData);
  };

  return { index };
}
