/* eslint-disable react/display-name */
import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Grid, Typography } from "@mui/material";

export interface Props {
    streamName?: string;
    stream?: MediaStream;
    userName: string;
}
type VideoProps = {
    title: string;
} & React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
>;
const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
    ({ title, ...props }, ref) => {
        const VideoElem = useMemo(() => {
            return (
                <video
                    className="w-full aspect-square bg-black"
                    ref={ref}
                    {...props}
                />
            );
        }, []);
        return (
            <div>
                <Typography
                    variant="h5"
                    gutterBottom
                    className="text-gray-200"
                >
                    {title || "Name"}
                </Typography>
                {VideoElem}
            </div>
        );
    }
);

const VideoPlayer = ({ stream, userName, streamName }: Props) => {
    const otherStream = useRef<HTMLVideoElement>();
    const ownStream = useRef<HTMLVideoElement>();
    useEffect(() => {
        if (!otherStream.current || !stream) return;
        otherStream.current.srcObject = stream;
    }, [stream, otherStream.current]);
    useLayoutEffect(() => {
        if (ownStream.current)
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((currentStream) => {
                    ownStream.current!.srcObject = currentStream;
                });
    }, [ownStream.current]);
    return (
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2">
            <Video
                title={userName || "Name"}
                playsInline
                muted
                ref={ownStream as any}
                autoPlay
            />

            {stream && (
                <Video
                    title={streamName || ""}
                    playsInline
                    ref={otherStream as any}
                    autoPlay
                />
            )}
        </div>
    );
};

export default VideoPlayer;
