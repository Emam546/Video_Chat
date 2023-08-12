import React, { useContext } from "react";
import { Button } from "@mui/material";
interface Props {
    notif?: {
        name: string;
        id: string;
    };
    onAnswerCall: (id: string) => any;
}
const Notifications = ({  notif, onAnswerCall }: Props) => {
    // const { answerCall, call, callAccepted } = useContext(SocketContext);

    return (
        <>
            {notif  && (
                <div
                    style={{ display: "flex", justifyContent: "space-around" }}
                >
                    <h1>{notif.name} is calling:</h1>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            onAnswerCall(notif.id);
                        }}
                    >
                        Answer
                    </Button>
                </div>
            )}
        </>
    );
};

export default Notifications;
