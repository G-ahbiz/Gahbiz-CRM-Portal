export const environment = {
  production: false,
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
    updateLead: (id: string) => `/leads/${id}`,
    getLeadById: (id: string) => `/leads/${id}`,
    exportLeads: '/leads/export',
    importLeads: '/leads/import',
  },
  activityLog: {
    getleadActivities: (id: string) => `/ActivityLog/leadActivities/${id}`,
    createActivityLog: '/ActivityLog',
    deleteActivityLog: (id: string) => `/ActivityLog/${id}`,
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
    updateCustomer: '/Customers/update',
    deleteCustomer: (id: string) => `/Customers/${id}`,
    getSalesAgents: '/SalesManagement/agentsList',
    exportCustomers: '/Customers/export',
  },
  invoices: {
    getAllInvoices: '/Invoices',
    addInvoice: '/Invoices',
    getInvoice: (id: string) => `/Invoices/${id}`,
    updateInvoice: (id: string) => `/Invoices/${id}`,
  },
  crmOrder: {
    getAllOrders: '/CRMOrders',
    getOrder: (id: string) => `/CRMOrders/${id}`,
    addOrder: '/CRMOrders/manual',
    addOrderFromLead: '/CRMOrders/from-lead',
    importOrders: '/CRMOrders/import',
  },
  statistics: {
    getOrderStatistics: '/Statistics/orders',
    geInvoicestStatistics: '/Statistics/invoices',
    getCustomerStatistics: '/Statistics/customers',
    getLeadsStatistics: '/Statistics/leads',
  },
  operations: {
    getAllServiceSubmissions: '/ServiceSubmissions',
    getServiceSubmission: (id: string) => `/ServiceSubmissions/${id}`,
    updateServiceSubmission: (clientServiceId: string) =>
      `/ServiceSubmissions/${clientServiceId}/status`,
    rejectServiceSubmission: (serviceSubmissionId: string) =>
      `/ServiceSubmissions/${serviceSubmissionId}/reject`,
    requestEdit: (serviceSubmissionId: string) =>
      `/ServiceSubmissions/request-edit/${serviceSubmissionId}`,
    acceptSubmission: (serviceSubmissionId: string) =>
      `/ServiceSubmissions/accept-files/${serviceSubmissionId}`,
    rejectSubmission: (serviceSubmissionId: string) =>
      `/ServiceSubmissions/${serviceSubmissionId}/reject`,
  },
};
