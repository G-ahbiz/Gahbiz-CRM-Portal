import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { ErrorFacadeService } from '@core/services/error.facade.service';
import { ToastService } from '@core/services/toast.service';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';
import { SalesAgentBrief } from '@features/customers-crm/interfaces/sales-agent-brief';
import { EditAgentRequest } from '@features/sales-crm/interfaces/edit-agent-request';
import { GetAgentDetailsResponse } from '@features/sales-crm/interfaces/get-agent-details';
import { AuthService } from '@core/services/auth.service';
import { USER_TYPES } from '@shared/config/constants';

@Component({
  selector: 'app-sales-agents-update',
  imports: [CommonModule, DialogModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './sales-agents-update.html',
  styleUrl: './sales-agents-update.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesAgentsUpdate {
  // Inputs
  visible = input<boolean>(false);
  agentId = input<string | null>(null);

  // Outputs
  visibleChange = output<boolean>();
  agentUpdated = output<GetAgentDetailsResponse>();

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
  editSalesAgentForm!: FormGroup;

  // Translation keys
  readonly translationKeys = {
    TITLE: 'SALES-CRM.EDIT-SALES-AGENT.TITLE',
    FULL_NAME: 'SALES-CRM.EDIT-SALES-AGENT.FULL_NAME',
    FULL_NAME_PLACEHOLDER: 'SALES-CRM.EDIT-SALES-AGENT.FULL_NAME_PLACEHOLDER',
    EMAIL: 'SALES-CRM.EDIT-SALES-AGENT.EMAIL',
    EMAIL_PLACEHOLDER: 'SALES-CRM.EDIT-SALES-AGENT.EMAIL_PLACEHOLDER',
    MONTHLY_TARGET: 'SALES-CRM.EDIT-SALES-AGENT.MONTHLY_TARGET',
    MONTHLY_TARGET_PLACEHOLDER: 'SALES-CRM.EDIT-SALES-AGENT.MONTHLY_TARGET_PLACEHOLDER',
    MANAGER: 'SALES-CRM.EDIT-SALES-AGENT.MANAGER',
    MANAGER_PLACEHOLDER: 'SALES-CRM.EDIT-SALES-AGENT.MANAGER_PLACEHOLDER',
    IS_ACTIVE: 'SALES-CRM.EDIT-SALES-AGENT.IS_ACTIVE',
    CANCEL: 'COMMON.CANCEL',
    SUBMIT: 'SALES-CRM.EDIT-SALES-AGENT.SUBMIT',
    SUBMITTING: 'SALES-CRM.EDIT-SALES-AGENT.SUBMITTING',
    SUCCESS: 'SALES-CRM.EDIT-SALES-AGENT.SUCCESS',
    ERROR: 'SALES-CRM.EDIT-SALES-AGENT.ERROR',
  };

  constructor() {
    this.initForm();

    effect(() => {
      const isVisible = this.visible();
      const id = this.agentId();
      if (isVisible && id) {
        this.loadAgentDetails(id);
      }
    });

    this.loadManagers();
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      if (user && user.type !== USER_TYPES.MANAGER && user.type === USER_TYPES.ADMIN) {
        this.editSalesAgentForm.get('managerId')?.setValue(user.id);
        this.isManager.set(false);
      } else {
        this.loadManagers();
      }
    });
  }

  private initForm(): void {
    this.editSalesAgentForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      monthlyTarget: [null, [Validators.required, Validators.min(0)]],
      managerId: [null as string | null],
      isActive: [true],
    });
  }

  private loadAgentDetails(agentId: string): void {
    this.loading.set(true);

    this.salesAgentFacade
      .getSalesAgentDetails(agentId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const data = response.data;
            this.editSalesAgentForm.patchValue({
              fullName: data.fullName,
              email: data.email,
              monthlyTarget: data.monthlyTarget,
              managerId: data.managerId || null,
              isActive: data.isActive,
            });
          } else {
            this.errorFacade.showError(response);
          }
        },
        error: (error) => {
          this.errorFacade.showError(error);
        },
      });
  }

  private loadManagers(): void {
    this.salesAgentFacade
      .getManagersDropdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    if (this.editSalesAgentForm.invalid) {
      this.editSalesAgentForm.markAllAsTouched();
      return;
    }

    const id = this.agentId();
    if (!id) return;

    this.submitting.set(true);

    const formValue = this.editSalesAgentForm.value;
    const request: EditAgentRequest = {
      fullName: formValue.fullName,
      email: formValue.email,
      monthlyTarget: formValue.monthlyTarget,
      managerId: formValue.managerId || undefined,
      isActive: formValue.isActive,
    };

    this.salesAgentFacade
      .updateSalesAgent(id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.toastService.success(this.translate.instant(this.translationKeys.SUCCESS));
            this.agentUpdated.emit(response.data);
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
    this.editSalesAgentForm.reset({ isActive: true });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.editSalesAgentForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldValidityClass(fieldName: string): string {
    const control = this.editSalesAgentForm.get(fieldName);
    if (!control) return '';
    return control.valid ? 'text-success' : 'text-danger';
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.editSalesAgentForm.get(fieldName);
    return !!(control && control.hasError(errorType) && control.touched);
  }
}
