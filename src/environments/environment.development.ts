export const environment = {
  baseApi: 'https://serva-best.runasp.net/api/',

  leads: {
    getLeads: 'leads',
    searchLeads: 'leads/search',
    addLead: 'leads/add',
    deleteLead: (id: string) => `leads/${id}`,
  },
};
