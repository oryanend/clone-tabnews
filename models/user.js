import database from "infra/database.js";
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

async function create(userInputValues) {
  await validateUsername(userInputValues.username);
  await validateEmail(userInputValues.email);

  const newUser = await runInsertUserQuery(userInputValues);
  return newUser;

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
        action: "Utilize outro email para cadastrar o usuário.",
      });
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
        action: "Utilize outro nome de usuário para o cadastro.",
      });
    }
  }

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

const user = {
  create,
  findByUsername,
};

export default user;
