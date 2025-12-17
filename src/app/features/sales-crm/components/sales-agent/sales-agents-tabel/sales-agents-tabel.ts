import {
  Component,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  DestroyRef,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
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
import { LeadsFacadeService } from '@features/sales-crm/services/leads/leads-facade.service';
import { ToastService } from '@core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { LeadDetails } from '@features/sales-crm/interfaces/lead-details';
import { LeadSummaryItem } from '@features/sales-crm/interfaces/lead-summary';
import { USER_TYPES } from '@shared/config/constants';
import { LeadsDetails } from '../../leads/lead-detail-dialog/leads-details/leads-details';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { LanguageService } from '@core/services/language.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

const SESSION_STORAGE_KEYS = {
  LEAD_ID: 'leadId',
} as const;

@Component({
  selector: 'app-sales-agents-tabel',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    RouterLink,
    DialogModule,
    TranslateModule,
    LeadsDetails,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sales-agents-tabel.html',
  styleUrls: ['./sales-agents-tabel.css'],
})
export class SalesAgentsTabel implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dt1') dt1!: Table;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  @Input() salesAgentId!: string;

  loading = signal<boolean>(true);
  leadsData = signal<LeadSummaryItem[]>([]);
  selectedLeads = signal<number[]>([]); // Changed from string[] to number[]
  exportLoading = signal<boolean>(false);

  showLeadModal = signal<boolean>(false);
  selectedLeadId = signal<string | null>(null);
  selectedLeadData = signal<LeadDetails | null>(null);

  private readonly leadsFacadeService = inject(LeadsFacadeService);
  private readonly SalesAgentFacadeService = inject(SalesAgentFacadeService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly languageService = inject(LanguageService);

  currentUser = signal<User | null>(null);
  searchValue = signal<string>('');
  userTypes = USER_TYPES;

  // Selection state
  isAllSelected: boolean = false;

  // Pagination state
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  // Search state
  private searchSubject = new Subject<string>();

  // Screen width for responsive design
  screenWidth: number = window.innerWidth;

  // Add for responsive pagination
  get responsiveRowsPerPageOptions(): number[] {
    return this.screenWidth < 768 ? [5, 10] : [5, 10, 20, 50];
  }

  // Track screen resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUser.set(user);
    });

    this.setupSearchSubscription();
    if (this.salesAgentId) {
      this.loadLeads();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salesAgentId'] && this.salesAgentId) {
      this.pageNumber = 1; // Reset to first page when sales agent changes
      this.loadLeads();
    }
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
        this.loadLeads();
      });
  }

  loadLeads(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize,
    searchValue: string = this.searchValue()
  ) {
    if (!this.salesAgentId) {
      this.leadsData.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    this.SalesAgentFacadeService.getLeadsBySalesAgentId(this.salesAgentId, {
      pageNumber,
      pageSize,
      searchTerm: searchValue,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            const leads = response.data.items || [];
            // Add selection state to each lead - FIX: use number IDs
            const leadsWithSelection = leads.map((lead) => ({
              ...lead,
              selected: this.selectedLeads().includes(lead.id), // lead.id is number
            }));
            this.leadsData.set(leadsWithSelection);
            this.totalRecords = response.data.totalCount || 0;
            this.pageNumber = response.data.pageNumber || 1;
            this.totalPages = response.data.totalPages || 0;
            this.updateSelectAllState();
          } else {
            this.toast.error(response.message);
          }
        },
        error: (error: any) => {
          console.error('Error fetching leads by sales agent:', error);
          this.toast.error(
            this.translateService.instant('SALES-CRM.SALES-AGENTS-CARDS.ERROR.FAILED_TO_LOAD_LEADS')
          );
        },
      });
  }

  getStatusBadgeClass(status: string | null): string {
    if (!status) return 'bg-secondary text-white';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'new':
        return 'bg-primary text-white';
      case 'qualified':
        return 'bg-success text-white';
      case 'contacted':
        return 'bg-warning text-dark';
      case 'in-progress':
      case 'in progress':
        return 'bg-info text-white';
      case 'converted':
        return 'bg-success text-white';
      case 'lost':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  viewLead(id: string | number) {
    const leadId = id.toString(); // Convert to string for the API call
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

  onDeleteLead(id: string | number) {
    const leadId = id.toString(); // Convert to string for the API
    this.confirmationService.confirm({
      message: this.translateService.instant('LEADS.DELETE_CONFIRMATION'),
      header: this.translateService.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteLead(leadId, id); // Pass both string and number versions
      },
    });
  }

  private deleteLead(id: string, originalId: string | number): void {
    this.loading.set(true);
    this.leadsFacadeService.deleteLead(id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.toast.success(this.translateService.instant('LEADS.DELETE_SUCCESS'));
          // Remove from selected leads if it was selected
          const numId = typeof originalId === 'number' ? originalId : Number(originalId);
          this.selectedLeads.set(this.selectedLeads().filter((leadId) => leadId !== numId));
          this.loadLeads(this.pageNumber, this.pageSize, this.searchValue());
        } else {
          this.toast.error(response.message);
        }
      },
      error: (error) => {
        console.error('Error deleting lead:', error);
        this.toast.error(this.translateService.instant('LEADS.DELETE_ERROR'));
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
    this.searchSubject.next(value);
  }

  clearSelections(): void {
    this.selectedLeads.set([]);
    this.leadsData().forEach((lead) => {
      lead.selected = false;
    });
    this.isAllSelected = false;
    this.toast.info(
      this.translateService.instant('SALES-CRM.SALES-AGENTS-CARDS.selection-cleared')
    );
  }

  onSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isAllSelected = checkbox.checked;

    const currentSelectedIds = new Set<number>(this.selectedLeads()); // Use Set<number>

    // Update selection state for all visible leads on current page
    this.leadsData().forEach((lead) => {
      lead.selected = this.isAllSelected;
      if (this.isAllSelected) {
        currentSelectedIds.add(lead.id); // lead.id is number
      } else {
        currentSelectedIds.delete(lead.id); // lead.id is number
      }
    });

    this.selectedLeads.set(Array.from(currentSelectedIds));
  }

  toggleLeadSelection(lead: LeadSummaryItem) {
    lead.selected = !lead.selected;
    const currentSelectedIds = new Set<number>(this.selectedLeads()); // Use Set<number>

    if (lead.selected) {
      currentSelectedIds.add(lead.id); // lead.id is number
    } else {
      currentSelectedIds.delete(lead.id); // lead.id is number
    }

    this.selectedLeads.set(Array.from(currentSelectedIds));
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

  editLead(id: string | number) {
    this.router.navigate(['/main/sales/leads/edit-lead', id]);
  }

  exportLeads() {
    if (this.selectedLeads().length === 0) {
      this.toast.error(
        this.translateService.instant('SALES-CRM.SALES-AGENTS-CARDS.select-at-least-one-lead-to-export')
      );
      return;
    }

    this.exportLoading.set(true);
    // Convert number IDs to string IDs for export
    const stringIds = this.selectedLeads().map((id) => id.toString());

    this.leadsFacadeService.exportLeads(stringIds).subscribe({
      next: (blob: Blob) => {
        this.exportLoading.set(false);

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `sales-agent-leads-export-${timestamp}.xlsx`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        const successMessage = this.translateService.instant('SALES-CRM.SALES-AGENTS-CARDS.export-success', {
          count: this.selectedLeads().length,
        });
        this.toast.success(successMessage);
      },
      error: (error) => {
        this.exportLoading.set(false);
        this.toast.error(this.translateService.instant('SALES-CRM.SALES-AGENTS-CARDS.export-failed'));
        console.error('Export error:', error);
      },
    });
  }

  getServiceName(lead: LeadSummaryItem) {
    const serviceNames: string[] = [];
    lead.servicesOfInterest?.forEach((service) => {
      serviceNames.push(service.name);
    });
    return serviceNames.join(', ') || this.translateService.instant('COMMON.NOT_AVAILABLE');
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
