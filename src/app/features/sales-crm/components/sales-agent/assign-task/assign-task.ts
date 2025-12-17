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
import { DatePickerModule } from 'primeng/datepicker';
import { finalize } from 'rxjs/operators';

import { ErrorFacadeService } from '@core/services/error.facade.service';
import { ToastService } from '@core/services/toast.service';
import { AssignTaskRequest } from '@features/sales-crm/interfaces/assign-task-request';
import { GetSalesAgentsResponse } from '@features/sales-crm/interfaces/get-sales-agents-response';
import { SalesAgentFacadeService } from '@features/sales-crm/services/sales-agent/sales-agent-facade.service';

type TaskStatus = AssignTaskRequest['status'];

interface StatusOption {
  label: string;
  value: TaskStatus;
}

@Component({
  selector: 'app-assign-task',
  imports: [DialogModule, TranslateModule, ReactiveFormsModule, DatePickerModule],
  templateUrl: './assign-task.html',
  styleUrl: './assign-task.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignTask implements OnInit {
  maxDate(): Date | null | undefined {
    throw new Error('Method not implemented.');
  }
  // Inputs
  visible = input<boolean>(false);

  // Outputs
  visibleChange = output<boolean>();
  taskAssigned = output<AssignTaskRequest>();

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly salesAgentFacade = inject(SalesAgentFacadeService);
  private readonly errorFacade = inject(ErrorFacadeService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  // Signals
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  salesAgents = signal<GetSalesAgentsResponse[]>([]);

  // Form
  assignTaskForm!: FormGroup;

  // Status options
  readonly statusOptions: StatusOption[] = [
    { label: 'SALES-CRM.ASSIGN-TASK.STATUS_CREATED', value: 'Created' },
    { label: 'SALES-CRM.ASSIGN-TASK.STATUS_DELAYED', value: 'Delayed' },
    { label: 'SALES-CRM.ASSIGN-TASK.STATUS_CANCELLED', value: 'Cancelled' },
    { label: 'SALES-CRM.ASSIGN-TASK.STATUS_CLOSED', value: 'Closed' },
  ];

  // Translation keys
  readonly translationKeys = {
    TITLE: 'SALES-CRM.ASSIGN-TASK.TITLE',
    LEAD_ID: 'SALES-CRM.ASSIGN-TASK.LEAD_ID',
    LEAD_ID_PLACEHOLDER: 'SALES-CRM.ASSIGN-TASK.LEAD_ID_PLACEHOLDER',
    NOTE: 'SALES-CRM.ASSIGN-TASK.NOTE',
    NOTE_PLACEHOLDER: 'SALES-CRM.ASSIGN-TASK.NOTE_PLACEHOLDER',
    STATUS: 'SALES-CRM.ASSIGN-TASK.STATUS',
    STATUS_PLACEHOLDER: 'SALES-CRM.ASSIGN-TASK.STATUS_PLACEHOLDER',
    ASSIGNEE: 'SALES-CRM.ASSIGN-TASK.ASSIGNEE',
    ASSIGNEE_PLACEHOLDER: 'SALES-CRM.ASSIGN-TASK.ASSIGNEE_PLACEHOLDER',
    DUE_DATE: 'SALES-CRM.ASSIGN-TASK.DUE_DATE',
    DUE_DATE_PLACEHOLDER: 'SALES-CRM.ASSIGN-TASK.DUE_DATE_PLACEHOLDER',
    CANCEL: 'COMMON.CANCEL',
    ASSIGN: 'SALES-CRM.ASSIGN-TASK.ASSIGN',
    ASSIGNING: 'SALES-CRM.ASSIGN-TASK.ASSIGNING',
    SUCCESS: 'SALES-CRM.ASSIGN-TASK.SUCCESS',
    ERROR: 'SALES-CRM.ASSIGN-TASK.ERROR',
  };

  ngOnInit(): void {
    this.initForm();
    this.loadSalesAgents();
  }

  private initForm(): void {
    this.assignTaskForm = this.fb.group({
      leadId: ['', [Validators.required]],
      note: [''],
      status: [null, [Validators.required]],
      assigneeId: [null, [Validators.required]],
      dueDate: [null, [Validators.required]],
    });
  }

  private loadSalesAgents(): void {
    this.loading.set(true);

    this.salesAgentFacade
      .getAllSalesAgents({ pageNumber: 1, pageSize: 100 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data?.items) {
            this.salesAgents.set(response.data.items);
          }
        },
        error: (error) => {
          this.errorFacade.showError(error);
        },
      });
  }

  onSubmit(): void {
    if (this.assignTaskForm.invalid) {
      this.assignTaskForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const formValue = this.assignTaskForm.value;
    const formData = this.convertToFormData(formValue);

    this.salesAgentFacade
      .assignTask(formData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.success(this.translate.instant(this.translationKeys.SUCCESS));

            const request: AssignTaskRequest = {
              leadId: formValue.leadId,
              note: formValue.note || '',
              status: formValue.status,
              assigneeId: formValue.assigneeId,
              dueDate: this.formatDate(formValue.dueDate),
            };

            this.taskAssigned.emit(request);
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

  private convertToFormData(formValue: Record<string, unknown>): FormData {
    const formData = new FormData();

    formData.append('leadId', formValue['leadId'] as string);
    formData.append('note', (formValue['note'] as string) || '');
    formData.append('status', formValue['status'] as string);
    formData.append('assigneeId', formValue['assigneeId'] as string);
    formData.append('dueDate', this.formatDate(formValue['dueDate'] as Date));

    return formData;
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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
    this.assignTaskForm.reset();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const control = this.assignTaskForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldValidityClass(fieldName: string): string {
    const control = this.assignTaskForm.get(fieldName);
    if (!control) return '';
    return control.valid ? 'text-success' : 'text-danger';
  }
}
