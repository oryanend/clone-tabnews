import status from "pages/api/v1/status";

export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno do servidor ocorreu.", { cause });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte se o problema persistir.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
