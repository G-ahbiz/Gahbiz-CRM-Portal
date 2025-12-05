import {
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  DestroyRef,
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
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { LeadSummaryItem } from '@features/sales-crm/interfaces/lead-summary';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ROUTES, USER_TYPES } from '@shared/config/constants';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LeadsDetails } from '../lead-detail-dialog/leads-details/leads-details';
import { DialogModule } from 'primeng/dialog';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';

const SESSION_STORAGE_KEYS = {
  LEAD_ID: 'leadId',
} as const;

const ALLOWED_SORT_FIELDS = ['firstName', 'status', 'source', 'sourceName'] as const;

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
    LeadsDetails,
    DialogModule,
    TranslateModule,
  ],
  templateUrl: './leads-tabel.html',
  styleUrl: './leads-tabel.css',
  providers: [AllData],
})
export class LeadsTabel implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  loading = signal<boolean>(true);
  leadsData = signal<LeadSummaryItem[]>([]);
  selectedLeads = signal<string[]>([]);
  leadsTabelHeader: readonly string[] = leadsTabelHeader;
  activityValues: number[] = [0, 100];
  userTypes = USER_TYPES;

  showLeadModal = signal<boolean>(false);
  selectedLeadId = signal<string | null>(null);
  selectedLeadData = signal<LeadDetails | null>(null);

  private readonly leadsFacadeService = inject(LeadsFacadeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  currentUser = signal<User | null>(null);
  searchValue = signal<string>('');
  sortColumn = signal<string>('');
  sortDirection = signal<string>('ASC');

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
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser.set(user);
    });

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
    searchValue: string = this.searchValue(),
    sortColumn: string = this.sortColumn(),
    sortDirection: string = this.sortDirection()
  ) {
    this.loading.set(true);
    this.leadsFacadeService
      .getAllLeads(pageNumber, pageSize, searchValue, sortColumn, sortDirection)
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

  viewLead(id: string | number) {
    const leadId = id.toString();
    this.selectedLeadId.set(leadId);

    this.loading.set(true);
    this.leadsFacadeService.getLeadById(leadId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.selectedLeadData.set(response.data);
          this.showLeadModal.set(true);
        } else {
          this.toast.error(
            this.translateService.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS')
          );
          this.selectedLeadData.set(null);
          this.showLeadModal.set(false);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.toast.error(this.translateService.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEAD_DETAILS'));
        this.selectedLeadData.set(null);
        this.showLeadModal.set(false);
        this.loading.set(false);
      },
    });
  }

  closeLeadModal() {
    this.showLeadModal.set(false);
    this.selectedLeadId.set(null);
    this.selectedLeadData.set(null);
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
    this.pageNumber =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
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

  editLead(id: number) {
    this.router.navigate(['/main/sales/leads/edit-lead', id]);
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

  onSortColumn(event: any) {
    // Only allow sorting on specific columns
    if (!ALLOWED_SORT_FIELDS.includes(event.field)) {
      console.warn(`Sorting not allowed for field: ${event.field}`);
      return;
    }

    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadLeads(
      this.pageNumber,
      this.pageSize,
      this.searchValue(),
      this.sortColumn(),
      this.sortDirection()
    );
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
