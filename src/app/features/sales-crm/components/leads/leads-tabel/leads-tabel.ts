import {
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Router, RouterLink } from '@angular/router';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AllData } from '../../../../../services/all-data';
import { Leads } from '../../../interfaces/leads';
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { LeadSummary, LeadSummaryItem } from '@features/sales-crm/interfaces/lead-summary';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule } from '@ngx-translate/core';

const SESSION_STORAGE_KEYS = {
  LEAD_ID: 'leadId',
} as const;

export const leadsTabelHeader: readonly string[] = [
  'ID',
  'Name',
  'Service',
  'Status',
  'Source',
  'Assigned To',
  'Value',
  'Created Date',
];
@Component({
  selector: 'app-leads-tabel',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './leads-tabel.html',
  styleUrl: './leads-tabel.css',
  providers: [AllData],
})
export class LeadsTabel implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  loading = signal<boolean>(true);
  leadsData = signal<LeadSummaryItem[]>([]);
  selectedLeads = signal<string[]>([]);
  leadsTabelHeader: readonly string[] = leadsTabelHeader;
  activityValues: number[] = [0, 100];

  private readonly leadsFacadeService = inject(LeadsFacadeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  searchValue = signal<string>('');
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Selection state
  isAllSelected: boolean = false;

  // Pagination state
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  // Search state
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.setupSearchSubscription();
    this.loadLeads();
  }

  private setupSearchSubscription() {
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only emit if value changed
      )
      .subscribe((searchValue) => {
        this.searchValue.set(searchValue);
        this.pageNumber = 1;
        this.leadsFacadeService.searchLeads(this.pageNumber, this.pageSize, searchValue).subscribe({
          next: (response) => {
            if (response.succeeded) {
              this.leadsData.set(response.data.items || []);
            }
          },
        });
      });
  }

  loadLeads(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize,
    searchValue: string = this.searchValue()
  ) {
    this.loading.set(true);
    this.leadsFacadeService
      .getAllLeads(pageNumber, pageSize, searchValue)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.leadsData.set(response.data.items || []);
            this.totalRecords = response.data.totalCount || 0;
            this.pageNumber = response.data.pageNumber || 1;
            this.totalPages = response.data.totalPages || 0;
          } else {
            this.toast.error(response.message);
          }
        },
        error: (error: any) => {
          console.error(error.message || 'An error occurred while fetching leads');
        },
      });
  }

  onDeleteLead(id: string) {
    this.loading.set(true);
    this.leadsFacadeService.deleteLead(id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.loadLeads(this.pageNumber, this.pageSize, this.searchValue());
        } else {
          this.toast.error(response.message);
        }
      },
      error: (error) => {
        console.error(error.message || 'An error occurred while fetching leads');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: any) {
    this.pageNumber = event.page + 1; // PrimeNG uses 0-based index
    this.pageSize = event.rows;
    this.loadLeads(this.pageNumber, this.pageSize);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value); // Emit to subject instead of calling loadLeads directly
  }

  clear(table: Table) {
    this.searchValue.set('');
    this.searchInput.nativeElement.value = '';
    table.clear();
    this.loadLeads(this.pageNumber, this.pageSize, this.searchValue());
  }

  onSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;
    // Update selection state for all visible leads on current page
    this.leadsData().forEach((lead) => {
      lead.selected = this.isAllSelected;
    });
    if (this.isAllSelected) {
      this.selectedLeads.set(this.leadsData().map((lead) => lead.id.toString()));
    } else {
      this.selectedLeads.set([]);
    }
  }

  toggleLeadSelection(lead: LeadSummaryItem) {
    lead.selected = !lead.selected;
    if (lead.selected) {
      this.selectedLeads.set([...this.selectedLeads(), lead.id.toString()]);
    } else {
      this.selectedLeads.set(
        this.selectedLeads().filter((id: string) => id !== lead.id.toString())
      );
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    const currentPageLeads = this.leadsData();
    if (currentPageLeads.length === 0) {
      this.isAllSelected = false;
      return;
    }

    this.isAllSelected = currentPageLeads.every((lead) => lead.selected);
  }

  viewLead(id: number) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.LEAD_ID, id.toString());
    this.router.navigate(['/main/sales/leads/leads-details']);
  }

  editLead(id: number) {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.LEAD_ID, id.toString());
    this.router.navigate(['/main/sales/leads/add-lead']);
  }
  exportLeads() {
    if (this.selectedLeads().length === 0) {
      this.toast.error('Please select at least one lead to export');
      return;
    }

    this.loading.set(true);
    this.leadsFacadeService.exportLeads(this.selectedLeads()).subscribe({
      next: (blob: Blob) => {
        this.loading.set(false);

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `leads-export-${timestamp}.xlsx`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toast.success('Leads exported successfully');
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error('Failed to export leads');
        console.error('Export error:', error);
      },
    });
  }
  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
