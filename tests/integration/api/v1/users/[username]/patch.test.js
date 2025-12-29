import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With non-existent 'username'", async () => {
      const getResponse = await fetch(
        `http://localhost:3000/api/v1/users/NonExistentUser`,
        {
          method: "PATCH",
        },
      );
      expect(getResponse.status).toBe(404);

      const responseBody = await getResponse.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O nome de usuario não foi encontrado.",
        action: "Verifique o nome de usuario e tente novamente.",
        statusCode: 404,
      });
    });

    test("With duplicate 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@test.com",
          password: "somepassword123",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@test.com",
          password: "somepassword123",
        }),
      });
      expect(user2Response.status).toBe(201);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Esse nome de usuário já está sendo utilizado.",
        action: "Utilize outro nome de usuário para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("With duplicate 'email'", async () => {
      const email1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@test.com",
          password: "somepassword123",
        }),
      });
      expect(email1Response.status).toBe(201);

      const email2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@test.com",
          password: "somepassword123",
        }),
      });
      expect(email2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@test.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        statusCode: 400,
      });
    });

    test("With unique 'username'", async () => {
      const createdUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "createdUser",
            email: "createdUser@test.com",
            password: "somepassword123",
          }),
        },
      );
      expect(createdUserResponse.status).toBe(201);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/createdUser`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "updatedUser",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "updatedUser",
        email: "createdUser@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "createdEmail",
            email: "createdEmail@test.com",
            password: "somepassword123",
          }),
        },
      );
      expect(createdUserResponse.status).toBe(201);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/createdEmail`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "updatedEmail@test.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "createdEmail",
        email: "updatedEmail@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "createdNewPassword",
            email: "createdNewPassword@test.com",
            password: "createPassword123",
          }),
        },
      );
      expect(createdUserResponse.status).toBe(201);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/createdNewPassword`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "updatedPassword123",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "createdNewPassword",
        email: "createdNewPassword@test.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findByUsername("createdNewPassword");
      const correctPasswordMatch = await password.compare(
        "updatedPassword123",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const wrongPasswordMatch = await password.compare(
        "createPassword123",
        userInDatabase.password,
      );
      expect(wrongPasswordMatch).toBe(false);
    });
  });
});
