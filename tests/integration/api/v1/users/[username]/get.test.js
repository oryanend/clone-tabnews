import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import database from "infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MesmoCase",
          email: "mesmocase@example.com",
          password: "somepassword123",
        }),
      });
      expect(response.status).toBe(201);

      const getResponse = await fetch(
        `http://localhost:3000/api/v1/users/MesmoCase`,
      );
      expect(getResponse.status).toBe(200);

      const responseBody = await getResponse.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoCase",
        email: "mesmocase@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With exact case miss match", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseDiff",
          email: "casediff@example.com",
          password: "somepassword123",
        }),
      });
      expect(response.status).toBe(201);

      const getResponse = await fetch(
        `http://localhost:3000/api/v1/users/casediff`,
      );
      expect(getResponse.status).toBe(200);

      const responseBody = await getResponse.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "CaseDiff",
        email: "casediff@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With non-existent username", async () => {
      const getResponse = await fetch(
        `http://localhost:3000/api/v1/users/NonExistentUser`,
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
  });
});
