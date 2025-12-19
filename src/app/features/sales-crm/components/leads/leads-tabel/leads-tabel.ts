import {
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  DestroyRef,
  HostListener,
  computed
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
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
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { LanguageService } from '@core/services/language.service';
import {
  LEAD_DELETE_ROLES,
  LEAD_IMPORT_ROLES,
  LEAD_ADD_ROLES,
  hasPermission,
} from '@shared/utils/role-permissions';

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
    TooltipModule,
    ConfirmDialogModule,
    SkeletonModule,
  ],
  templateUrl: './leads-tabel.html',
  styleUrl: './leads-tabel.css',
  providers: [AllData, ConfirmationService],
})
export class LeadsTabel implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: any;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Pagination state
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  // Sorting state
  sortColumn = signal<string>('');
  sortDirection = signal<string>('ASC');

  // Loading states
  loading = signal<boolean>(true);
  exportLoading = signal<boolean>(false);
  bulkDeleteLoading = signal<boolean>(false);

  // Data signals
  leadsData = signal<LeadSummaryItem[]>([]);
  selectedLeadIds = signal<Set<string>>(new Set());

  // Selection state
  isAllSelected: boolean = false;

  // Modal state
  showLeadModal = signal<boolean>(false);
  selectedLeadId = signal<string | null>(null);
  selectedLeadData = signal<LeadDetails | null>(null);

  // Search state
  searchValue = signal<string>('');
  private searchSubject = new Subject<string>();

  // User and services
  userTypes = USER_TYPES;
  currentUser = signal<User | null>(null);

  // Screen responsiveness
  screenWidth: number = window.innerWidth;

  // Services
  private readonly leadsFacadeService = inject(LeadsFacadeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly languageService = inject(LanguageService);

  // Responsive pagination
  get responsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  currentUser = signal<User | null>(null);
  searchValue = signal<string>('');
  sortColumn = signal<string>('');
  sortDirection = signal<string>('ASC');

  // Role-based permissions
  canDeleteLead = computed(() => hasPermission(this.currentUser()?.type, LEAD_DELETE_ROLES));
  canImportLeads = computed(() => hasPermission(this.currentUser()?.type, LEAD_IMPORT_ROLES));
  canAddLead = computed(() => hasPermission(this.currentUser()?.type, LEAD_ADD_ROLES));

  // Selection state
  isAllSelected: boolean = false;

  // Pagination state
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser.set(user);
    });

    this.setupSearchSubscription();
    this.loadLeads();
  }

  private setupSearchSubscription() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((searchValue) => {
      this.searchValue.set(searchValue);
      this.pageNumber = 1;
      this.loadLeads();
    });
  }

  loadLeads() {
    this.loading.set(true);
    this.leadsFacadeService
      .getAllLeads(
        this.pageNumber,
        this.pageSize,
        this.searchValue(),
        this.sortColumn(),
        this.sortDirection()
      )
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            const data = response.data.items || [];
            this.leadsData.set(
              data.map((lead) => ({
                ...lead,
                selected: this.selectedLeadIds().has(lead.id.toString()),
              }))
            );
            this.totalRecords = response.data.totalCount || 0;
            this.updateSelectAllState();
          } else {
            this.toast.error(response.message);
          }
        },
        error: (error: any) => {
          console.error(error.message || 'An error occurred while fetching leads');
          this.toast.error(this.translateService.instant('LEADS.ERRORS.FAILED_TO_LOAD_LEADS'));
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
    this.confirmationService.confirm({
      message: this.translateService.instant('LEADS.DELETE_CONFIRMATION'),
      header: this.translateService.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteLead(id);
      },
    });
  }

  private deleteLead(id: string) {
    this.loading.set(true);
    this.leadsFacadeService.deleteLead(id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.toast.success(this.translateService.instant('LEADS.DELETED_SUCCESSFULLY'));

          // Remove from selected IDs if it was selected
          const currentSelectedIds = new Set(this.selectedLeadIds());
          currentSelectedIds.delete(id);
          this.selectedLeadIds.set(currentSelectedIds);

          this.loadLeads();
        } else {
          this.toast.error(response.message);
        }
      },
      error: (error) => {
        console.error(error.message || 'An error occurred while deleting lead');
        this.toast.error(this.translateService.instant('LEADS.ERRORS.FAILED_TO_DELETE_LEAD'));
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  deleteSelectedLeads() {
    const selectedIds = Array.from(this.selectedLeadIds());

    if (selectedIds.length === 0) {
      this.toast.error(this.translateService.instant('LEADS.SELECT_AT_LEAST_ONE_LEAD_TO_DELETE'));
      return;
    }

    this.confirmationService.confirm({
      message: this.translateService.instant('LEADS.DELETE_MULTIPLE_CONFIRMATION', {
        count: selectedIds.length,
      }),
      header: this.translateService.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performBulkDelete(selectedIds);
      },
    });
  }

  private performBulkDelete(ids: string[]) {
    this.bulkDeleteLoading.set(true);

    this.leadsFacadeService
      .deleteMultipleLeads?.(ids)
      ?.pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.bulkDeleteLoading.set(false))
      )
      .subscribe({
        next: (result: any) => {
          // Handle bulk delete result similar to customers component
          if (result.succeeded?.length > 0) {
            this.toast.success(
              this.translateService.instant('LEADS.BULK_DELETE_SUCCESS', {
                count: result.succeeded.length,
              })
            );

            // Remove successful deletions from selected IDs
            const currentSelectedIds = new Set(this.selectedLeadIds());
            result.succeeded.forEach((id: string) => currentSelectedIds.delete(id));
            this.selectedLeadIds.set(currentSelectedIds);
          }

          if (result.failed?.length > 0) {
            const errorMessage = this.translateService.instant('LEADS.SOME_LEADS_DELETE_FAILED', {
              count: result.failed.length,
            });
            this.toast.error(errorMessage);
          }

          this.loadLeads();
        },
        error: (err) => {
          console.error('Error in bulk delete operation:', err);
          this.toast.error(this.translateService.instant('LEADS.ERRORS.BULK_DELETE_FAILED'));
        },
      });
  }

  onPageChange(event: any) {
    this.pageNumber =
      event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.loadLeads();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clear() {
    this.searchValue.set('');
    this.searchInput.nativeElement.value = '';
    this.searchSubject.next('');
  }

  onSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    const currentSelectedIds = new Set(this.selectedLeadIds());

    this.leadsData().forEach((lead) => {
      lead.selected = this.isAllSelected;
      if (this.isAllSelected) {
        currentSelectedIds.add(lead.id.toString());
      } else {
        currentSelectedIds.delete(lead.id.toString());
      }
    });

    this.selectedLeadIds.set(currentSelectedIds);
  }

  toggleLeadSelection(lead: LeadSummaryItem) {
    lead.selected = !lead.selected;

    const currentSelectedIds = new Set(this.selectedLeadIds());
    if (lead.selected) {
      currentSelectedIds.add(lead.id.toString());
    } else {
      currentSelectedIds.delete(lead.id.toString());
    }
    this.selectedLeadIds.set(currentSelectedIds);

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

  get selectedLeadsCount(): number {
    return this.selectedLeadIds().size;
  }

  editLead(id: number) {
    this.router.navigate(['/main/sales/leads/edit-lead', id]);
  }

  exportLeads() {
    const selectedIds = Array.from(this.selectedLeadIds());

    if (selectedIds.length === 0) {
      this.toast.error(this.translateService.instant('LEADS.SELECT_AT_LEAST_ONE_LEAD_TO_EXPORT'));
      return;
    }

    this.exportLoading.set(true);
    this.leadsFacadeService.exportLeads(selectedIds).subscribe({
      next: (blob: Blob) => {
        this.exportLoading.set(false);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `leads-export-${timestamp}.xlsx`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toast.success(
          this.translateService.instant('LEADS.EXPORT_SUCCESS', {
            count: selectedIds.length,
          })
        );
      },
      error: (error) => {
        this.exportLoading.set(false);
        this.toast.error(this.translateService.instant('LEADS.EXPORT_FAILED'));
        console.error('Export error:', error);
      },
    });
  }

  clearSelections() {
    this.selectedLeadIds.set(new Set());
    this.leadsData().forEach((lead) => {
      lead.selected = false;
    });
    this.isAllSelected = false;
    this.toast.info(this.translateService.instant('LEADS.SELECTION_CLEARED'));
  }

  onSortColumn(event: any) {
    if (!ALLOWED_SORT_FIELDS.includes(event.field)) {
      console.warn(`Sorting not allowed for field: ${event.field}`);
      return;
    }

    this.sortColumn.set(event.field);
    this.sortDirection.set(event.order === 1 ? 'ASC' : 'DESC');
    this.loadLeads();
  }

  getServiceName(lead: LeadSummaryItem) {
    const serviceNames: string[] = [];
    lead.servicesOfInterest?.forEach((service) => {
      serviceNames.push(service.name);
    });
    return serviceNames.join(', ');
  }

  trackByLeadId(index: number, lead: LeadSummaryItem): string {
    return lead.id.toString();
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
