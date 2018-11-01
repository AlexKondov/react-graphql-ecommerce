const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const { transport, makeANiceEmail } = require("../mail");

const mutations = {
  async createItem(parent, args, context, info) {
    if (!context.request.userId) {
      throw new Error("You must be logged in to do that!");
    }

    const item = await context.db.mutation.createItem(
      {
        data: {
          // This is how we create a relationship between
          // the item and the user
          user: {
            connect: {
              id: context.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    return item;
  },

  async updateItem(parent, args, context, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the id from the updates
    delete updates.id;
    // run the update method
    return context.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteItem(parent, args, context, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await context.db.query.item({ where }, `{ id, title}`);
    // 2. check if they own the item
    // 3. delete it
    return context.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, context, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the db
    const user = await context.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // We set the jwt as a cookie on the response
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    //return the user
    return user;
  },

  async signin(parent, { email, password }, context, info) {
    // Check if there is a user with that email
    const user = await context.db.query.user({ where: { email } });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error("Invalid password!");
    }
    // Generate JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // Set the cookie with the token
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    // Return the user
    return user;
  },

  signout(parent, args, context, info) {
    context.response.clearCookie("token");
    return { message: "Goodbye!" };
  },

  async requestReset(parent, { email }, context, info) {
    // 1. Check if this is a real user
    const user = await context.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Set a reset token and expiry
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await context.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    // 3. Email them that reset token
    const mailResponse = await transport.sendMail({
      from: "alex@kondov.rocks",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`
        Your Password Reset Token is here!
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click Here to Reset</a>
      `)
    });

    return { message: "Thanks" };
  },

  async resetPassword(parent, args, context, info) {
    // 1. Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match!");
    }
    // 2. Check if it's a legit reset token
    // 3. Check if it's expired
    const [user] = await context.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) {
      throw new Error("This token is either invalid or expired!");
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken
    const updatedUser = await context.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT Cookie
    context.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // 8. Return the new user
    return updatedUser;
  }
};

module.exports = mutations;
