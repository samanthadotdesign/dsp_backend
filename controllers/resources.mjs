export default function initResourceController(db) {
  const index = async (req, res) => {
    const { userId } = req.cookies;
    const { title, link, skillId } = req.body;

    try {
      const newResource = await db.Resource.create({
        resourceName: title,
        resourceLink: link,
        skillId,
        isDefault: false,
      });
      const user = await db.User.findByPk(userId);

      await newResource.addUser(user);

      res.send(newResource);
    } catch (error) {
      console.log(error);
    }
  };

  return { index };
}
