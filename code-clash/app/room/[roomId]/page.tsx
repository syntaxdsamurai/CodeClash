import React from 'react';

export default function RoomPage({ params }: { params: { roomId: string } }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1>Room ID: {params.roomId}</h1>
            <p>Loading Arena...</p>
            {/* You can render your <Arena /> component here later */}
        </div>
    );
}