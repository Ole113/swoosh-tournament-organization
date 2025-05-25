interface Tournament {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  format: string;
  maxTeams: number;
  teamSize: number;
  showEmail: boolean;
  showPhone: boolean;
  createdByName: string;
  createdByPhone: string;
  createdByEmail: string;
  inviteLink: string;
  password: string;
  isPrivate: boolean;
}

export default Tournament;
