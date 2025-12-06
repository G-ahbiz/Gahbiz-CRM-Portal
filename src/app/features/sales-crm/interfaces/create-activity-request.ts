export interface CreateActivityRequest {
  leadId: string;
  type: 'None' | 'PhoneCall' | 'OnlineChat' | 'Email' | 'Other';
  traffic: 'None' | 'Outgoing' | 'Incoming';
  status: 'None' | 'Positive' | 'Negative' | 'WrongData';
  callStatus: 'None' | 'Response' | 'NoResponse';
  duration: {
    hour: number;
    minute: number;
    second: number;
  };
  followUpDate: string;
  details: string;
  source: string;
  need: string;
  opportunityPercentage: number;
}
