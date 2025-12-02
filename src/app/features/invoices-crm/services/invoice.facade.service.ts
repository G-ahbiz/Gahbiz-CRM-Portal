import { inject, Injectable } from '@angular/core';
import { InvoiceApiService } from './invoice.api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { Observable } from 'rxjs';
import { GetAllInvoicesResponse } from '../interfaces/get-all-invoices-response';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { GetInvoicesFilters } from '../interfaces/get-invoices-filters';

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
}
