import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import session from "models/session.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorsHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findByValidToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObj.id);

  await controller.setSessionCookie(renewedSessionObject, response);

  const userFound = await user.findById(sessionObj.user_id);
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response.status(200).json(userFound);
}
