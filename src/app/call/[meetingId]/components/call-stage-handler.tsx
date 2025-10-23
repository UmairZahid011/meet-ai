'use client';

import {
  useCall,
} from '@stream-io/video-react-sdk';

import CallLobby from './call-lobby';
import ActiveCallUI from './call-active';
import CallEndedUI from './call=ended';
import { useState } from 'react';

interface CallStageHandlerProps {
  meetingName: string;
  router: any;
  userName: string,
}

export default function CallStageHandler({ meetingName, router,userName }: CallStageHandlerProps) {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby")
  const [joinLoading, setJoinLoading] = useState(false)
  
  const handleStartMeeting = async () => {
    try {
      if (call) {
        setJoinLoading(true)
        await call.join();
        setShow('call')
      }
    } catch (e) {
      setJoinLoading(false)
      console.error('Failed to start meeting:', e);
    }
  };

  const handleEndCallAndRedirect = async () => {
    try {
      if (call) {
        await call.endCall();
        setShow("ended")
      }
    //   router.push('/user/meetings');
    } catch (e) {
      console.error('Error ending call or redirecting:', e);
    }
  };

  return(
    <div className="h-full">
        {
            show === "lobby" && 
            <CallLobby 
                meetingName={meetingName}
                userName={userName}
                joinLoading={joinLoading}
                onStartMeeting={handleStartMeeting}
                onCancel={() => router.push('/user/meetings')}
            />
        }
        {
            show === "call" && 
            <ActiveCallUI 
                meetingName={meetingName}
                onEndCall={handleEndCallAndRedirect}
            />
        }
        {
            show === "ended" && 
            <CallEndedUI/>
        }
    </div>
  )
}