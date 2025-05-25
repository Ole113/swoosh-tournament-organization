import Participant from "./Participant";

export default interface Team {
  name: string;
  description: string;
  teamId: string;
  record: string;
  participantSet: Participant[];
  isPrivate: boolean;
  password: string;
  inviteLink: string;
  createdBy: Participant;
}
