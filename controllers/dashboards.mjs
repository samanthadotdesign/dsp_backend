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
    const resources = await db.Resource.findAll();

    let skillsCompleted;
    const skillIdsCompleted = [];

    let categoriesCompleted;
    const categoryIdsCompleted = [];

    if (userId !== 0) {
      skillsCompleted = await db.UserSkill.findAll({
        where: {
          id: userId,
          completed: true,
        },
      });

      for (let i = 0; i < skillsCompleted.length; i += 1) {
        skillIdsCompleted.push(skillsCompleted[i].id);
      }

      // user_categories
      // db.Category -> query the categories table
      // Include: find the categories with the userId
      categoriesCompleted = await db.Category.findAll({
        include: {
        // From the users table, find the PK
          model: db.User,
          where: {
            id: userId,
          },
        },
      });

      // categoriesCompleted = [ { id: ... userId ... category_id: ... createdAt, updatedAt}, {} ]
      // categoryIdsCompleted = [1,2,3]
      for (let i = 0; i < categoriesCompleted.length; i += 1) {
        categoryIdsCompleted.push(categoriesCompleted[i].id);
      }
    } else {
      skillsCompleted = {};
      categoriesCompleted = {};
    }

    result = {
      sections,
      categories,
      skills,
      resources,
      skillIdsCompleted,
      categoryIdsCompleted,
    };
  } catch (error) {
    console.log('Error getting dashboard data', error);
  }
  return result;
};

export default function initDashboardController(db) {
  // Get dashboard data
  // Use async/await here to getDashboardData
  const index = async (req, res) => {
    const { id: userId } = req.params;
    let dashboardData;
    if (userId) {
      dashboardData = await getDashboardData(db, userId);
    }
    else {
      dashboardData = await getDashboardData(db);
    }
    // Object that holds all the dashboard data
    res.send(dashboardData);
  };

  // Send array of resource objects as response
  const resources = async (req, res) => {
    // We still need the userId to get the specific user's added resources
    // const { userId } = req.cookies;
    const { skillId, userId } = req.params;

    try {
      const user = await db.User.findByPk(userId);
      const resourcesInSkill = await user.getResources();
      console.log('******************************************************************************************');
      console.log(resourcesInSkill);
      // resourcesInSkill = [ {id...resourceName ... resourceLink}, ...]

      // Create an object where the keys are the skillId for easy retrieval
      const result = {};
      for (let i = 0; i < resourcesInSkill.length; i += 1) {
        // Check if the skillId key exists in the object, add to array
        if (result[resourcesInSkill[i].skillId]) {
          result[resourcesInSkill[i].skillId].push({
            name: resourcesInSkill[i].resourceName,
            link: resourcesInSkill[i].resourceLink,
            // favicon: resourcesInSkill[i].favicon,
          });
        }
        // If the key doesn't exist, create an array + create the first object inside
        else {
          result[resourcesInSkill[i].skillId] = [{
            name: resourcesInSkill[i].resourceName,
            link: resourcesInSkill[i].resourceLink,
            // favicon: resourcesInSkill[i].favicon,
          }];
        }
      }
      /* object = {
        1: [ {name: ..., link: ...}. {name..., link ...}],
        2: [],
        3: [] ...
      } */
      res.send(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(200);
    }
  };

  return { index, resources };
}
