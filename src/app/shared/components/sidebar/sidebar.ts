import {
  Component,
  OnInit,
  signal,
  Output,
  EventEmitter,
  Input,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  ALL_CRM_ROLES,
  OPERATIONS_ROLES,
  ROUTES,
  SALES_ROLES,
  USER_TYPES,
} from '@shared/config/constants';
import { LanguageService } from '@core/services/language.service';
import { AuthService } from '@core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  @Input() isMobile: boolean = false;
  @Input() isSidebarCollapsed: boolean = false;
  @Output() sidebarToggled = new EventEmitter<void>();
  @Output() sidebarCollapsedToggled = new EventEmitter<void>();

  private languageService = inject(LanguageService);
  private authService = inject(AuthService);

  // Current user signal from AuthService
  private currentUser = toSignal(this.authService.currentUser$);

  // User role computed signal
  private userRole = computed(() => this.currentUser()?.type ?? '');

  // Role-based visibility computed signals
  canViewDashboard = computed(() => this.hasRole([USER_TYPES.ADMIN]));
  canViewCustomers = computed(() => this.hasRole(SALES_ROLES));
  canViewSalesLeads = computed(() =>
    this.hasRole([...SALES_ROLES, USER_TYPES.SALES_AGENT_PROVIDER])
  );
  canViewSalesAgents = computed(() => this.hasRole([USER_TYPES.MANAGER, USER_TYPES.ADMIN]));

  canViewOperations = computed(() => this.hasRole(OPERATIONS_ROLES));
  canViewInvoices = computed(() => this.hasRole(SALES_ROLES));
  canViewOrders = computed(() => this.hasRole(SALES_ROLES));
  canViewReports = computed(() => this.hasRole([USER_TYPES.ADMIN]));
  canViewSettings = computed(() => this.hasRole(ALL_CRM_ROLES));

  // Sales sidebar button
  isSalesActive = signal<boolean>(false);
  isLeadsActive = signal<boolean>(false);
  isSalesAgentsActive = signal<boolean>(false);

  // Reports sidebar button
  isSalesReportsActive = signal<boolean>(false);
  isLeadsReportsActive = signal<boolean>(false);
  isReportsActive = signal<boolean>(false);

  Routes = ROUTES;
  isRTL = this.languageService.isRTL;
  All_CRM_Roles = ALL_CRM_ROLES;
  Sales_Roles = SALES_ROLES;
  Operations_Roles = OPERATIONS_ROLES;

  /**
   * Check if current user has any of the allowed roles
   */
  private hasRole(allowedRoles: string[]): boolean {
    const role = this.userRole();
    return allowedRoles.includes(role);
  }

  ngOnInit() {
    // Initialize based on current route
    this.checkActiveRoutes();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    } else {
      this.sidebarCollapsedToggled.emit();
    }
  }

  handleNavigationClick() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  handelDashboardClick() {
    window.location.href = ROUTES.dashboard;
  }

  onLinkClick() {
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  toggleSalesActive() {
    this.isSalesActive.set(!this.isSalesActive());
  }

  toggleLeadsActive() {
    this.isLeadsActive.set(true);
    this.isSalesAgentsActive.set(false);
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  toggleSalesAgentsActive() {
    this.isSalesAgentsActive.set(true);
    this.isLeadsActive.set(false);
    if (this.isMobile) {
      this.sidebarToggled.emit();
    }
  }

  toggleReportsActive() {
    this.isReportsActive.set(!this.isReportsActive());
  }

  toggleSalesReportsActive() {
    this.isSalesReportsActive.set(!this.isSalesReportsActive());
    this.isLeadsReportsActive.set(false);
  }
  toggleLeadsReportsActive() {
    this.isLeadsReportsActive.set(!this.isLeadsReportsActive());
    this.isSalesReportsActive.set(false);
  }

  private checkActiveRoutes() {
    // You can implement logic here to check current route
    // and set active states accordingly
  }
}
