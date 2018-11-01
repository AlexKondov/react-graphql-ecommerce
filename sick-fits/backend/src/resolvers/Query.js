const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, context, info) {
    // Check if there is a current user ID
    if (!context.request.userId) {
      return null;
    }

    return context.db.query.user(
      { where: { id: context.request.userId } },
      info
    );
  },
  async users(parent, args, context, info) {
    // 0. Check if  they are logged in
    if (!context.request.userId) {
      throw new Error("You must be logged in!");
    }
    // 1. Check if the user has permissions
    hasPermission(context.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    // 2. Query all the users
    return context.db.query.users({}, info);
  }
};

module.exports = Query;
