export const environment = {
  production: true,
  baseApi: 'https://serva-best.runasp.net/api',
  account: {
    login: '/Account/login',
    refresh: '/Account/refresh-token',
    forgotPassword: '/Account/forgot-password',
    resetPassword: '/Account/reset-password',
    resendOtp: '/Account/resend-otp',
    confirmEmail: '/Account/ConfirmEmail', // link to confirm email
    resendEmailConfirmation: '/Account/resend-email-confirmation',
    verifyOtp: '/Account/verify-otp', // OTP to verify email
    getProfile: '/Account/profile',
    CompleteProfile: '/Account/Profile',
  },
  leads: {
    getLeads: '/leads',
    searchLeads: '/leads/search',
    addLead: '/leads/add',
    deleteLead: (id: string) => `/leads/${id}`,
    exportLeads: '/leads/export',
    importLeads: '/leads/import',
  },
  services: {
    getAllServices: '/Services',
    getServiceByCategory: '/Services/category/',
    getServiceById: '/Services/',
    bestOffers: '/Services/best-offers',
    searchServices: (text: string) => `/Services/search/${text}`,
  },
  customers: {
    addCustomer: '/Customers/Customer',
    leadToCustomer: (leadId: string) => `/Customers/${leadId}/ConvertLeadToCustomer`,
    getCustomer: '/Customers', // provide id and/or name in query
    getAllCustomers: '/Customers/all',
    updateCustomer: '/Customers/update', // provide id in query
    deleteCustomer: (id: string) => `/Customers/${id}`,
    getSalesAgents: '/SalesManagement/agentsList',
  },

  invoices: {
    getAllInvoices: '/Invoices',
    addInvoice: '/Invoices',
    getInvoice: (id: string) => `/Invoices/${id}`,
    updateInvoice: (id: string) => `/Invoices/${id}`,
  },
};
