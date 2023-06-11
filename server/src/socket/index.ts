import { Server, Socket } from "socket.io";
import http from "http";
<<<<<<< HEAD
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
=======
import { Questions } from "@serv/socket/Question";
import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import express, { Express } from "express";
import { questions } from "./init.json";
import { createClient } from "redis";
import EnvVars from "@serv/declarations/major/EnvVars";

const DB = createClient({
    url: EnvVars.REDIS_URL,
});

interface Question {
    msg: string;
    time: number;
    sender: Socket["id"];
}
enum MESSAGE_STATES {
    QUESTION,
    ANSWER,
}

function messageKind(msg: string): MESSAGE_STATES {
    if (msg.endsWith("?")) return MESSAGE_STATES.QUESTION;
    return MESSAGE_STATES.ANSWER;
}
export class IoServer {
    QuestionArray: Questions<Question>;
    server: Express;
    private io: Server;
    app: http.Server;
    constructor() {
        this.server = express();
        this.app = http.createServer(this.server);
        this.io = new Server(this.app);
        this.QuestionArray = new Questions(5000);
        this.QuestionArray.push(
            ...questions.map((msg) => {
                return {
                    msg,
                    time: Date.now(),
                    sender: "",
                };
            })
        );
        DB.connect().then(() => {
            this.io.on("connection", (socket) => {
                socket.on("disconnect", () => {
                    DB.del(socket.id + "QA");
                    DB.del(socket.id + "QR");
                    this.QuestionArray.filter(
                        (que: Question) => que.sender == socket.id
                    );
                });
                socket.on(MESSAGE_EMIT, (msg: string) => {
                    msg = msg.toUpperCase();
                    if (msg)
                        switch (messageKind(msg)) {
                            case MESSAGE_STATES.QUESTION:
                                this.RECEIVE_QUESTION(socket, msg);
                                break;
                            case MESSAGE_STATES.ANSWER:
                                this.RECEIVE_ANSWER(socket, msg);
                                break;
                        }
                });
                socket.on(SEND_EMIT, () => {
                    this.sendRandomQuestion(socket);
                });
            });
        });
    }
    async RECEIVE_ANSWER(socket: Socket, msg: string) {
        let data = await DB.get(socket.id + "QR");
        if (data) {
            const res: Question = JSON.parse(data);
            const sender = this.io.sockets.sockets.get(res.sender);
            if (sender && sender.connected) {
                data = await DB.get(sender.id + "QA");
                if (data && data == res.msg) sender.emit(MESSAGE_EMIT, msg);
            }
        }

        this.sendRandomQuestion(socket);
    }
    async RECEIVE_QUESTION(socket: Socket, msg: string) {
        this.QuestionArray.enqueue({
            msg,
            sender: socket.id,
            time: Date.now(),
        });
        await DB.set(socket.id + "QA", msg);
    }
    async sendRandomQuestion(socket: Socket) {
        for (let i = 0; i < 10; i++) {
            const res = this.QuestionArray.dequeue();
            if (res) {
                if (res.sender != socket.id) {
                    await DB.set(socket.id + "QR", JSON.stringify(res));
                    socket.emit(MESSAGE_EMIT, res.msg);
                    return;
                }
            } else
                return socket.emit(
                    MESSAGE_EMIT,
                    "ASK A WEIRD QUESTION TO EVERYONE"
                );
        }
        socket.emit(MESSAGE_EMIT, "ASK A WEIRD QUESTION TO EVERYONE");
    }
>>>>>>> 6158424 (app nextjs)
}
export function ioExpress() {
    const io = new IoServer();
    return io.server;
}
