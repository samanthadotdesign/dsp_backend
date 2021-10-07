export default function initSkillController(db) {
  // Adds new skill to user, adds new category if complete
  const index = async (req, res) => {
    // skillCompleted is a boolean describing if the skill is completed or not
    // skillCompletedArr is array of skillIds of completed skills
    const { skillId, skillCompleted } = req.body;
    const { userId } = req.cookies;

    try {
      let categoryIsComplete = false;
      const currentSkill = await db.Skill.findByPk(skillId);
      const currentUser = await db.User.findByPk(userId);
      const currentCategoryId = currentSkill.categoryId;
      const currentCategory = await db.Category.findByPk(currentCategoryId);

      // For existing row in user_skill join table, update 'completed' as true
      // Find the instance of the user skill
      const userCompleteSkill = await db.UserSkill.findOne({
        where: {
          userId,
          skillId,
        },
      });

      // Check if the category is complete
      // Count the number of completed skills in that category
      const skillsInCategoryCount = await db.Skill.count({
        where: { categoryId: currentCategoryId },
      });

      // If the user hasn't completed the skill, update to true
      if (!skillCompleted) {
        // Save the updated userSkill
        userCompleteSkill.completed = true;
        await userCompleteSkill.save();

        // Find the number of skills user has completed in that category
        const skillObjectCompleted = await db.Skill.findAll({
          where: {
            categoryId: currentCategoryId,
          },
          include: {
            model: db.UserSkill,
            where: {
              userId,
              completed: true,
            },
          },
        });

        const userSkillsInCategoryCount = skillObjectCompleted.length;

        // If category is complete, mark category as complete
        if (skillsInCategoryCount === userSkillsInCategoryCount) {
          console.log('running if statement');
          // add a new row in user_categories table
          // first find instance of the category
          const category = await db.Category.findByPk(currentCategoryId);
          await category.addUser(currentUser);
          categoryIsComplete = true;
        }
      }

      // If the user has completed the skill, update to false
      else {
        // Save the updated userSkill
        userCompleteSkill.completed = false;
        await userCompleteSkill.save();

        // Removes category if exists in user_categories
        const category = await db.Category.findByPk(currentCategoryId);
        if (category) {
          await category.removeUser(currentUser);
          categoryIsComplete = false;
        }
      }

      res.send({ currentCategoryId, currentCategory, categoryIsComplete });
    } catch (error) {
      console.log(error);
    }
  };

  return { index };
}
