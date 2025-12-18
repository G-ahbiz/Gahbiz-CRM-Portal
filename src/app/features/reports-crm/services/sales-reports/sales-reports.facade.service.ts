import { inject, Injectable } from '@angular/core';
import { SalesReportsApiService } from './sales-reports.api.service';
import { PagenatedResponse } from '@core/interfaces/pagenated-response';
import { PaymentReportFilters } from '@features/reports-crm/interfaces/payment-report-filters';
import { ApiResponse } from '@core/interfaces/api-response';
import { GetPaymentsReportResponse } from '@features/reports-crm/interfaces/get=payments-report-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesReportsFacadeService {
  private readonly salesReportsApiService = inject(SalesReportsApiService);

  getPaymentsReport(
    filters: PaymentReportFilters
  ): Observable<ApiResponse<PagenatedResponse<GetPaymentsReportResponse>>> {
    return this.salesReportsApiService.getPaymentsReport(filters);
  }

  exportPaymentsReport(filters: PaymentReportFilters): Observable<Blob> {
    return this.salesReportsApiService.exportPaymentsReport(filters);
  }
}
