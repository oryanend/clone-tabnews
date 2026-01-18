import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Fintab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Teste de Assunto",
      text: "Teste de Corpo.",
    });

    await email.send({
      from: "Fintab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Ultimo Email",
      text: "Ultimo email corpo.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Ultimo Email");
    expect(lastEmail.text).toBe("Ultimo email corpo.\n");
  });
});
