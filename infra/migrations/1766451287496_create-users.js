const { use } = require("react");

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // For referral purposes, GitHub's username limit is 39 characters
    username: { type: "varchar(30)", notNull: true, unique: true },

    // Why 254? See https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
    email: { type: "varchar(254)", notNull: true, unique: true },

    // Why 60? See https://www.npmjs.com/package/bcrypt
    password: { type: "varchar(60)", notNull: true },

    created_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("timezone('utc', now())"),
      notNull: true,
    },
  });
};

exports.down = false;
