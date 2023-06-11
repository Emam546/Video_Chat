<<<<<<< HEAD
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
=======
import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import { ioExpress, IoServer } from "@serv/socket";
import EnvVars from "@serv/declarations/major/EnvVars";
import { NodeEnvs } from "@serv/declarations/enums";
import helmet from "helmet";
const io = new IoServer();
if (EnvVars.nodeEnv === NodeEnvs.Production) {
    io.server.use(helmet());
}

io.server.get("/api/info/emits", (req, res) => {
    res.send({
        msg_emit: MESSAGE_EMIT,
        send_emit: SEND_EMIT,
    });
});
export const listener = io.app;
>>>>>>> 6158424 (app nextjs)
export default io.server;
