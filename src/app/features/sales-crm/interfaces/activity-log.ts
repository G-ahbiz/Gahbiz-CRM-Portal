export interface ActivityLog {
  id: string;
  date: string;
  userName: string;
  profileImageUrl: string;
  type: 'None' | 'PhoneCall' | 'OnlineChat' | 'Email' | 'Other';
  traffic: 'None' | 'Outgoing' | 'Incoming';
  status: 'None' | 'Positive' | 'Negative' | 'WrongData';
  callStatus: 'None' | 'Response' | 'NoResponse';
  duration: string;
  followUpDate: string;
  details: string;
  source: string;
  opportunityPercentage: number;
  need: string;

  isCollapsed?: boolean; // Optional for UI state
}
