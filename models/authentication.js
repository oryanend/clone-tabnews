import user from "models/user.js";
import password from "models/password";
import { NotFoundError, UnauthorizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação inválidos.",
        action: "Verifique os dados informados e tente novamente.",
      });
    }
    throw error;
  }

  async function findByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se esse dado informado está correto.",
        });
      }
      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedUserPassword) {
    const isPasswordValid = await password.compare(
      providedPassword,
      storedUserPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se esse dado informado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
