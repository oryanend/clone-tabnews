import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "oryanend",
          email: "oryanend@example.com",
          password: "somepassword123",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "oryanend",
        email: "oryanend@example.com",
        password: "somepassword123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicate 'email'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "firstDuplicateEmail",
          email: "email@duplicate.com",
          password: "somepassword123",
        }),
      });
      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "secondDuplicateEmail",
          email: "Email@duplicate.com",
          password: "somepassword123",
        }),
      });
      expect(secondResponse.status).toBe(400);

      const responseBody = await secondResponse.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email já está sendo utilizado.",
        action: "Utilize outro email para cadastrar o usuário.",
        statusCode: 400,
      });
    });

    test("With duplicate 'username'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateUsername",
          email: "firstemail@test.com",
          password: "somepassword123",
        }),
      });
      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "DuplicateUsername",
          email: "secondemail@test.com",
          password: "somepassword123",
        }),
      });
      expect(secondResponse.status).toBe(400);

      const responseBody = await secondResponse.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Esse nome de usuário já está sendo utilizado.",
        action: "Utilize outro nome de usuário para o cadastro.",
        statusCode: 400,
      });
    });
  });
});
