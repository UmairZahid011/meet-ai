import { useState } from 'react';
import {
  PaginatedGridLayout,
  RecordCallButton,
  SpeakerLayout,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface ActiveCallUIProps {
  meetingName: string;
  onEndCall: () => void;
}

export default function ActiveCallUI({ meetingName, onEndCall }: ActiveCallUIProps) {

  const CallLayout = () => {
    return <SpeakerLayout participantsBarPosition="left" />;
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="flex justify-between items-center px-4 mb-4">
        <h4 className="text-xl font-bold">Meeting: {meetingName}</h4>
      </div>

      <div className="relative flex size-full items-center justify-center">
        <div className=" flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
      </div>
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 p-4 bg-gray-800">
        {/* <CallControls />  */}
        <ToggleAudioPreviewButton/>
        <ToggleVideoPreviewButton/>
        <RecordCallButton/>
        <Button variant="destructive" className='bg-[#dc433b] rounded-full w-[36px] h-[36px]' onClick={onEndCall}>
          <Phone/>
        </Button>
      </div>
    </section>
  );
}