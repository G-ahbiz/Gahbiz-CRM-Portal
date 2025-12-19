import { inject, Injectable } from '@angular/core';
import { InvoiceApiService } from './invoice.api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable } from 'rxjs';
import { GetAllInvoicesResponse } from '../interfaces/get-all-invoices-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetInvoicesFilters } from '../interfaces/get-invoices-filters';
import { GetInvoiceetails } from '../interfaces/get-invoice-details';
import { AddInvoiceRequest } from '../interfaces/add-invoice-request';
import { UpdateInvoiceRequest } from '../interfaces/update-invoice-request';
import { InvoicesStatistics } from '../interfaces/statistics';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InvoiceFacadeService {
  private readonly invoiceServiceApi = inject(InvoiceApiService);

  getAllInvoices(
    filters: GetInvoicesFilters
  ): Observable<ApiResponse<PagenatedResponse<GetAllInvoicesResponse>>> {
    return this.invoiceServiceApi.getAllInvoices(filters);
  }

  getInvoiceDetails(id: string): Observable<ApiResponse<GetInvoiceetails>> {
    return this.invoiceServiceApi.getInvoiceDetails(id);
  }

  addInvoice(invoice: AddInvoiceRequest): Observable<ApiResponse<string>> {
    return this.invoiceServiceApi.addInvoice(invoice);
  }

  updateInvoiceDetails(
    id: string,
    request: UpdateInvoiceRequest
  ): Observable<ApiResponse<GetInvoiceetails>> {
    return this.invoiceServiceApi.updateInvoiceDetails(id, request);
  }
  getStatistics(): Observable<ApiResponse<InvoicesStatistics>> {
    return this.invoiceServiceApi.getStatistics();
  }

  exportInvoice(invoiceIds: string[]): Observable<HttpResponse<Blob>> {
    return this.invoiceServiceApi.exportInvoice(invoiceIds);
  }
}
