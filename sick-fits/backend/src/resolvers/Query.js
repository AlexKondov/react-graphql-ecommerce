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
  },
  async order(parent, args, context, info) {
    if (!context.request.userId) {
      throw new Error("You must be logged in!");
    }

    const order = await context.db.query.order(
      { where: { id: args.id } },
      info
    );
    const ownsOrder = order.user.id === context.request.userId;
    const hasPermissionToSeeOrder = context.request.user.permissions.includes(
      "ADMIN"
    );

    if (!ownsOrder || !hasPermission) {
      throw new Error("You cannot see this bud!");
    }

    return order;
  },
  async orders(parent, args, context, info) {
    if (!context.request.userId) {
      throw new Error("You must be logged in!");
    }

    return context.db.query.orders(
      {
        where: { user: { id: context.request.userId } }
      },
      info
    );
  }
};

module.exports = Query;
