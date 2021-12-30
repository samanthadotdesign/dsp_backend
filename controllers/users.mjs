import bcrypt from 'bcrypt';

export default function initUserController(db) {
  // Add a new user that signs up
  const signup = async (req, res) => {
    const { name, email, password: userPassword } = req.body;
    console.log('***** REQUEST BODY FROM SIGNUP ****');
    console.log(req.body);
    try {
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      const newUser = await db.User.create({
        name,
        email,
        password: hashedPassword,
      });

      // When new user signs up, we create all the skills for that user (completed=False)
      const skills = await db.Skill.findAll();

      // bulkSkills is an array of objects
      const bulkSkills = [];
      for (let i = 0; i < skills.length; i += 1) {
        bulkSkills.push({ userId: newUser.id, skillId: skills[i].id });
      }
      await db.UserSkill.bulkCreate(bulkSkills);

      // Creating the default resources
      const resources = await db.Resource.findAll({
        where: {
          isDefault: true,
        },
      });
      await newUser.addResources(resources);

      res.cookie('loggedIn', true);
      res.cookie('userId', newUser.id);
      res.send({ newUser, status: 'OK' });
    } catch (error) {
      console.log('**** ERROR SIGNING UP ****');
      console.log(error);
      res.sendStatus(401);
    }
  };

  // Sign user in
  const login = async (req, res) => {
    const { email, password: inputPassword } = req.body;
    try {
      const user = await db.User.findOne({
        where: { email },
      });

      if (user) {
        const savedPassword = user.password;
        const correctPassword = await bcrypt.compare(inputPassword, savedPassword);

        if (!correctPassword) {
          console.log('We didn\'t recognize your password. Please try again!');
          res.sendStatus(403);
        }
        // Instead of res.cookie, we are sending cookies inside this response
        res.send({
          userId: user.id,
          status: 'OK',
          loggedIn: true,
        });
      } else {
        // If user doesn't exist
        console.log('error logging in', error);
        res.sendStatus(401);
      }
    } catch (error) {
      console.log('catching error in log in', error);
      res.sendStatus(401);
    }
  };

  // User logs out
  const logout = async (req, res) => {
    try {
      res.clearCookie('loggedIn');
      res.clearCookie('userId');
      res.sendStatus(200);
    } catch (error) {
      console.log('error logging out', error);
      res.sendStatus(401);
    }
  };

  return {
    signup, login, logout,
  };
}
