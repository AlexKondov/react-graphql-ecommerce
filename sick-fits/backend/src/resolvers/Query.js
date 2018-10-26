const { forwardTo } = require("prisma-binding");

const Query = {
  // async items(parent, args, context, info) {
  //   const items = await context.db.query.items();
  //   return items;
  // }
  items: forwardTo("db")
};

module.exports = Query;
