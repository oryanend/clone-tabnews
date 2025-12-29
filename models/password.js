import bcrypt from "bcryptjs";
import { environments } from "eslint-plugin-jest";

const pepper = process.env.PASSWORD;

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcrypt.hash(password + pepper, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(plainPassword, storedPassword) {
  return await bcrypt.compare(plainPassword + pepper, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
