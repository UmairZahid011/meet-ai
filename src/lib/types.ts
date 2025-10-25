export type Participant = {
  id: string;
  name: string;
  joined_at: string;
  email: string;
};
export type Meeting = {
  id: string;
  name: string;
  agent_id: string;
  status: "Upcoming" | "Active" | "Completed" | "Cancelled" | "Processing" | "Schedule";
  started_at: string;
  ended_at: string;
  recording_url: string;
  transcript_url: string;
  summary: string;
  participants: Participant[];
  start_date?: Date | null,
  agent_joined?: boolean
};

export type Agent = {
  id: string;
  name: string;
  instruction: string;
  userId? : number
};
export type StreamTranscriptItem ={
  speaker_id: string;
  type: string,
  text: string,
  start_ts:number,
  stop_ts: number,
}
export type Plan ={
  id: number;
  price: number;
  name:string;
  description: string;
  tokens: number;
}
export type Testimonial = {
  id: number;
  name: string;
  position: string;
  description: string;
  rating: number;
  image: string;
  created_at: string;
  updated_at: string;
};