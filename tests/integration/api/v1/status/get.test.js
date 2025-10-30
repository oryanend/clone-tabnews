test("GET should Return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
});

test("GET should Return 404 when version doesn't exist", async () => {
  const response = await fetch("http://localhost:3000/api/v2/status");
  expect(response.status).toBe(404);
});
