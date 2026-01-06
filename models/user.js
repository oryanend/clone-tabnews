import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function findByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
        SELECT  
          *
        FROM 
          users 
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O nome de usuario não foi encontrado.",
        action: "Verifique o nome de usuario e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function findByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
        SELECT  
          *
        FROM 
          users 
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O email não foi encontrado.",
        action: "Verifique o email e tente novamente.",
      });
    }

    return results.rows[0];
  }
}

async function create(userInputValues) {
  await validateUsername(userInputValues.username);
  await validateEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertUserQuery(userInputValues);
  return newUser;

  async function runInsertUserQuery(userInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const userFound = await findByUsername(username);

  if ("username" in userInputValues) {
    await validateUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...userFound, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(updatedUser) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', NOW())
      WHERE 
        id = $1
      RETURNING
        *
      `,
      values: [
        updatedUser.id,
        updatedUser.username,
        updatedUser.email,
        updatedUser.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUsername(username) {
  const results = await database.query({
    text: `
        SELECT  
          username 
        FROM 
          users 
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Esse nome de usuário já está sendo utilizado.",
      action: "Utilize outro nome de usuário para realizar esta operação.",
    });
  }
}

async function validateEmail(email) {
  const results = await database.query({
    text: `
        SELECT  
          email 
        FROM 
          users 
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Email já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findByUsername,
  findByEmail,
  update,
};

export default user;
