import bcrypt from "bcryptjs";
import { environments } from "eslint-plugin-jest";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcrypt.hash(password, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(plainPassword, storedPassword) {
  return await bcrypt.compare(plainPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
