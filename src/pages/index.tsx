<<<<<<< HEAD
import { AppBar, Typography } from "@mui/material";
import Notifications from "@src/components/Notifications";
import Sidebar from "@src/components/Sidebar";
import VideoPlayer from "@src/components/VideoPlayer";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import io from "socket.io-client";
import Head from "next/head";
import Peer, { SignalData } from "simple-peer";
import type {
    CallingData,
    AcceptedAnsweringData,
    AnsweringData,
} from "@serv/socket";
interface User {
    stream?: MediaStream;
    name: string;
}
interface ReqCaller {
    name: string;
    id: string;
    signal: SignalData;
}
const socket = io();
const Page = () => {
    const [ownStream, setOwnStream] = useState<MediaStream>();
    const [name, setName] = useState("");
    const curId = socket.id;
    const [callerName, setCallerName] = useState<string>();
    const [callerStream, setCallerStream] = useState<MediaStream>();
    const [reqCaller, setReqCaller] = useState<ReqCaller>();
    const [reqState, setRequestState] = useState<boolean>(false);
    const connectionRef = useRef<Peer.Instance>();
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setOwnStream(currentStream);
            });

        socket.on("callUser", ({ from, name, signal }: CallingData) => {
            setReqCaller({
                id: from,
                name: name,
                signal,
            });
        });
    }, []);
    useEffect(() => {
        const peer = connectionRef.current;
        if (!peer) return;
        peer.on("data", (name: Uint8Array) => {
            setCallerName(name.toString());
        });
        peer.on("error", () => {
            setCallerStream(undefined);
        });
    }, [connectionRef.current]);
    useEffect(() => {
        const peer = connectionRef.current;
        if (!peer || !peer.connected) return;
        peer.send(name);
    }, [name]);

    const callUser = (id: string) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: ownStream,
        });
        setRequestState(true);
        peer.on("stream", (stream) => {
            setRequestState(false);
            setCallerStream(stream);
        });
        socket.on("callAccepted", ({ signal, name }: AcceptedAnsweringData) => {
            peer.signal(signal); //starting the connection
            setCallerName(name);
        });
        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: curId,
                name,
            });
        });

        connectionRef.current = peer;
    };
    const answerCall = () => {
        if (!reqCaller) throw new Error("undefiled state");
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: ownStream,
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", {
                signal: data,
                to: reqCaller!.id || "",
                name,
                from: curId,
            } as AnsweringData);
        });
        peer.on("stream", (currentStream) => {
            setReqCaller(undefined);
            setCallerName(reqCaller.name);
            setCallerStream(currentStream);
        });
        peer.signal(reqCaller.signal);
        connectionRef.current = peer;
    };
    const leaveCall = () => {
        connectionRef.current?.destroy();
        setRequestState(false);
=======
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import CustomInput from "@src/components/customInput";
import { MessageType, Messages } from "@src/types";
import Message from "@src/components/Message";
import { MESSAGE_EMIT, SEND_EMIT } from "@serv/constants";
import Head from "next/head";
const socket = io();
const timeToWait = 60 * 3 * 1000;

function App() {
    const [isConnected, setIsConnected] = useState(false);

    const [messages, setMessages] = useState<Messages>([]);
    const [timeout, setGetMessage] = useState<ReturnType<typeof setTimeout>>();
    function appendMessage(msg: string, _type: MessageType = "REC") {
        setMessages((pre) => [...pre, { msg, _type }]);
    }
    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });
        socket.on(MESSAGE_EMIT, (msg) => {
            appendMessage(msg);
        });
        socket.emit(SEND_EMIT);
        setIsConnected(socket.connected);
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off(MESSAGE_EMIT);
        };
    }, []);
    function requestMessage() {
        setGetMessage((pre) =>
            setTimeout(() => {
                socket.emit(SEND_EMIT);
                if (pre) clearInterval(pre);
            }, timeToWait)
        );
    }
    const sendMessage = (msg: string) => {
        socket.emit(MESSAGE_EMIT, msg);
>>>>>>> 6158424 (app nextjs)
    };
    return (
        <>
            <Head>
<<<<<<< HEAD
                <title>Video Chat</title>
            </Head>
            <div className="px-3">
                <AppBar
                    className="my-8 flex items-center justify-center container mx-auto"
                    position="static"
                    color="inherit"
                >
                    <Typography
                        variant="h2"
                        align="center"
                    >
                        Video Chat
                    </Typography>
                </AppBar>
                <VideoPlayer
                    userName={name}
                    streamName={callerName}
                    stream={callerStream}
                />
                <Sidebar
                    callingState={reqState}
                    name={name}
                    setName={setName}
                    onAcceptCall={callUser}
                    onLeaveCall={leaveCall}
                    toClipBoard={curId}
                >
                    <Notifications
                        onAnswerCall={answerCall}
                        notif={reqCaller}
                    />
                </Sidebar>
            </div>
        </>
    );
};

export default Page;
=======
                <title>RadaLata</title>
            </Head>
            <div className="body-container">
                <ul>
                    <li>Connecting ....</li>
                    {messages.map((msg, i) => {
                        return (
                            <Message
                                {...msg}
                                key={i}
                            />
                        );
                    })}
                    {isConnected && (
                        <CustomInput
                            onBlur={(event) => {
                                event.currentTarget.focus();
                            }}
                            onKeyDown={(e) => {
                                if (e.keyCode == 13) {
                                    e.preventDefault();
                                    sendMessage(e.currentTarget.value);
                                    appendMessage(
                                        e.currentTarget.value,
                                        "SEND"
                                    );
                                    requestMessage();
                                    e.currentTarget.value = "";
                                }
                            }}
                        />
                    )}
                </ul>
            </div>
        </>
    );
}

export default App;
>>>>>>> 6158424 (app nextjs)
