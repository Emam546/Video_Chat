import { IoServer } from "@serv/socket";
import EnvVars from "@serv/declarations/major/EnvVars";
import { NodeEnvs } from "@serv/declarations/enums";
import helmet from "helmet";
import { ExpressPeerServer } from "peer";
const io = new IoServer();

if (EnvVars.nodeEnv === NodeEnvs.Production) {
    io.server.use(helmet());
}
// io.server.use("/peerjs", ExpressPeerServer(io.httpServer));
export const listener = io.httpServer;
export default io.server;
