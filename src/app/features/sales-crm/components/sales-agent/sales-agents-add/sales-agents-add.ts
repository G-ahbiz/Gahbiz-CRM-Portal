import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs/operators';

import { ErrorFacadeService } from '@core/services/error.facade.service';
import { ToastService } from '@core/services/toast.service';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { AddSalesAgentRequest } from '@features/sales-crm/interfaces/add-sales-agent-request';
import { AddSalesAgentResponse } from '@features/sales-crm/interfaces/add-sales-agent-response';
import { AuthService } from '@core/services/auth.service';
import { USER_TYPES } from '@shared/config/constants';

@Component({
  selector: 'app-sales-agents-add',
  imports: [DialogModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './sales-agents-add.html',
  styleUrl: './sales-agents-add.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesAgentsAdd implements OnInit {
  // Inputs
  visible = input<boolean>(false);

  // Outputs
  visibleChange = output<boolean>();
  agentAdded = output<AddSalesAgentResponse>();

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly salesAgentFacade = inject(SalesAgentFacadeService);
  private readonly errorFacade = inject(ErrorFacadeService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

  currentUser$ = this.authService.currentUser$;

  // Signals
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  managers = signal<SalesAgentBrief[]>([]);
  isManager = signal<boolean>(true);

  // Form
  addSalesAgentForm!: FormGroup;

  // Translation keys
  readonly translationKeys = {
    TITLE: 'SALES-CRM.ADD-SALES-AGENT.TITLE',
    FULL_NAME: 'SALES-CRM.ADD-SALES-AGENT.FULL_NAME',
    FULL_NAME_PLACEHOLDER: 'SALES-CRM.ADD-SALES-AGENT.FULL_NAME_PLACEHOLDER',
    EMAIL: 'SALES-CRM.ADD-SALES-AGENT.EMAIL',
    EMAIL_PLACEHOLDER: 'SALES-CRM.ADD-SALES-AGENT.EMAIL_PLACEHOLDER',
    PASSWORD: 'SALES-CRM.ADD-SALES-AGENT.PASSWORD',
    PASSWORD_PLACEHOLDER: 'SALES-CRM.ADD-SALES-AGENT.PASSWORD_PLACEHOLDER',
    MONTHLY_TARGET: 'SALES-CRM.ADD-SALES-AGENT.MONTHLY_TARGET',
    MONTHLY_TARGET_PLACEHOLDER: 'SALES-CRM.ADD-SALES-AGENT.MONTHLY_TARGET_PLACEHOLDER',
    MANAGER: 'SALES-CRM.ADD-SALES-AGENT.MANAGER',
    MANAGER_PLACEHOLDER: 'SALES-CRM.ADD-SALES-AGENT.MANAGER_PLACEHOLDER',
    CANCEL: 'COMMON.CANCEL',
    SUBMIT: 'SALES-CRM.ADD-SALES-AGENT.SUBMIT',
    SUBMITTING: 'SALES-CRM.ADD-SALES-AGENT.SUBMITTING',
    SUCCESS: 'SALES-CRM.ADD-SALES-AGENT.SUCCESS',
    ERROR: 'SALES-CRM.ADD-SALES-AGENT.ERROR',
  };

  ngOnInit(): void {
    this.initForm();
    this.loadManagers();
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      if (user && user.type !== USER_TYPES.MANAGER && user.type === USER_TYPES.ADMIN) {
        this.addSalesAgentForm.get('managerId')?.setValue(user.id);
        this.isManager.set(false);
      } else {
        this.loadManagers();
      }
    });
  }

  private initForm(): void {
    this.addSalesAgentForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      MonthlyTarget: [null, [Validators.required, Validators.min(0)]],
      managerId: [null],
    });
  }

  private loadManagers(): void {
    this.loading.set(true);

    this.salesAgentFacade
      .getManagersDropdown()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.managers.set(response.data);
          }
        },
        error: (error) => {
          this.errorFacade.showError(error);
        },
      });
  }

  onSubmit(): void {
    if (this.addSalesAgentForm.invalid) {
      this.addSalesAgentForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const formValue = this.addSalesAgentForm.value;
    const request: AddSalesAgentRequest = {
      fullName: formValue.fullName,
      email: formValue.email,
      password: formValue.password,
      MonthlyTarget: formValue.MonthlyTarget,
      managerId: formValue.managerId || undefined,
    };

    this.salesAgentFacade
      .addSalesAgent(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.toastService.success(this.translate.instant(this.translationKeys.SUCCESS));
            this.agentAdded.emit(response.data);
            this.closeDialog();
          } else {
            this.errorFacade.showError(response);
          }
        },
        error: (error) => {
          this.errorFacade.showError(error);
        },
      });
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  closeDialog(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.addSalesAgentForm.reset();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.addSalesAgentForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldValidityClass(fieldName: string): string {
    const control = this.addSalesAgentForm.get(fieldName);
    if (!control) return '';
    return control.valid ? 'text-success' : 'text-danger';
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.addSalesAgentForm.get(fieldName);
    return !!(control && control.hasError(errorType) && control.touched);
  }
}
