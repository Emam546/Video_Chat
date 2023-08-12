import React, { useState, ReactNode, Dispatch } from "react";
import { Button, TextField, Grid, Typography, Paper } from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Assignment, Phone, PhoneDisabled } from "@mui/icons-material";

interface Props {
    children: ReactNode;
    callingState: boolean;
    onLeaveCall: () => any;
    onAcceptCall: (id: string) => any;
    name: string;
    toClipBoard?: string;
    setName: Dispatch<string>;
}
const Sidebar = ({
    children,
    onLeaveCall,
    onAcceptCall,
    callingState,
    toClipBoard,
    name,
    setName,
}: Props) => {
    const [idToCall, setIdToCall] = useState("");
    return (
        <div className="container mx-auto bg-transparent">
            <Paper
                elevation={10}
                className="py-6 border-solid border-2 border-black"
            >
                <form
                    noValidate
                    autoComplete="off"
                >
                    <div className="flex flex-col sm:flex-row items-stretch justify-center w-full">
                        <Grid
                            item
                            xs={12}
                            md={6}
                            className="p-5"
                        >
                            <Typography
                                gutterBottom
                                variant="h6"
                            >
                                Account Info
                            </Typography>
                            <TextField
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                            />

                            <CopyToClipboard text={toClipBoard || ""}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<Assignment fontSize="large" />}
                                    className="mt-5"
                                    disabled={toClipBoard == ""}
                                >
                                    Copy Your ID
                                </Button>
                            </CopyToClipboard>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={6}
                            className="p-5"
                        >
                            <Typography
                                gutterBottom
                                variant="h6"
                            >
                                Make a call
                            </Typography>
                            <TextField
                                label="ID to call"
                                value={idToCall}
                                onChange={(e) => setIdToCall(e.target.value)}
                                fullWidth
                            />
                            {callingState ? (
                                <Button
                                    variant="contained"
                                    startIcon={
                                        <PhoneDisabled fontSize="large" />
                                    }
                                    fullWidth
                                    onClick={() => onLeaveCall()}
                                    className="mt-5"
                                >
                                    Hang Up
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Phone fontSize="large" />}
                                    fullWidth
                                    onClick={() => onAcceptCall(idToCall)}
                                    className="mt-5"
                                >
                                    Call
                                </Button>
                            )}
                        </Grid>
                    </div>
                </form>
                {children}
            </Paper>
        </div>
    );
};

export default Sidebar;
