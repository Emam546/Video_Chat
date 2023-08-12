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
    };
    return (
        <>
            <Head>
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
