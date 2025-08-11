import {
  DefaultVideoPlaceholder,
  useCallStateHooks,
  VideoPreview, 
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css'; // Stream's CSS
import { Button } from '@/components/ui/button';

interface CallLobbyProps {
  meetingName: string;
  userName: string,
  onStartMeeting: () => void;
  onCancel: () => void;
}

const DisabledVideoPreview=(userName: any)=>{
    return(
        <DefaultVideoPlaceholder
            participant={
                {
                    name: userName.userName,
                } as StreamVideoParticipant
            }
        />
    )
}

const AllowBrowserPermissions =()=>{
    return(
        <p className='!text-white'>
            Please grant your browser a permision to access your camera and microphone
        </p>
    )
}

export default function CallLobby({userName, meetingName, onStartMeeting }: CallLobbyProps) {

    const {useCameraState, useMicrophoneState} = useCallStateHooks();

    const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
    const { hasBrowserPermission: hasCameraPermission } = useCameraState();

    const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-white bg-dark-1 p-4">
        <div className='text-center text-black mb-8'>
            <h2 className="text-2xl font-bold mb-2 text-center">Ready to Join</h2>
            <p>Set up Your call before joining</p>
            <p className='text-sm font-semibold'>{meetingName}</p>
        </div>

        <div className="relative w-full max-w-[800px] aspect-video bg-gray-800 rounded-lg overflow-hidden mb-8">
            {/* Video Preview of local user */}
            <VideoPreview  
                DisabledVideoPreview={
                    hasBrowserMediaPermission ? 
                    () => <DisabledVideoPreview userName={userName} /> :
                    AllowBrowserPermissions
                }
                className='!w-full !h-full'
            />
        </div>

        <div className="flex gap-4 mb-8">
            <ToggleAudioPreviewButton/>
            <ToggleVideoPreviewButton/>
        </div>

        <div className="flex gap-4">
            <Button onClick={onStartMeeting}>
            Start Meeting
            </Button>
        </div>
        </section>
    );
}