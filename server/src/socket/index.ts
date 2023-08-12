import { Server, Socket } from "socket.io";
import http from "http";
import express, { Express } from "express";
import type { SignalData } from "simple-peer";
export interface CallingData {
    signal: SignalData;
    from: string;
    name: string;
}
export interface AnsweringData {
    to: string;
    from: string;
    name: string;
    signal: SignalData;
}
export interface AcceptedAnsweringData {
    from: string;
    name: string;
    signal: SignalData;
}
export class IoServer {
    server: Express;
    private io: Server;
    httpServer: http.Server;
    constructor() {
        this.server = express();
        this.httpServer = http.createServer(this.server);
        this.io = new Server(this.httpServer);

        this.io.on("connection", (socket) => {
            let curUser: string;
            socket.on("disconnect", () => {
                socket.to(curUser).emit("callEnded");
            });

            socket.on("callUser", ({ userToCall, signalData, from, name }) => {
                this.io.to(userToCall).emit("callUser", {
                    signal: signalData,
                    from,
                    name,
                } as CallingData);
            });

            socket.on("answerCall", (data: AnsweringData) => {
                curUser = data.to;
                this.io.to(data.to).emit("callAccepted", {
                    signal: data.signal,
                    from: data.to,
                    name: data.name,
                } as AcceptedAnsweringData);
            });
        });
    }
}
export function ioExpress() {
    const io = new IoServer();
    return io.server;
}
