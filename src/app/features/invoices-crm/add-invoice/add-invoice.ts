import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-invoice',
  imports: [TranslateModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-invoice.html',
  styleUrl: './add-invoice.css',
})
export class AddInvoice implements OnInit {

  addInvoiceForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addInvoiceForm = this.fb.group({
      customer: ['', Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      billDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      total: ['', Validators.required],
      services: ['', Validators.required],
      paymentReceived: ['', Validators.required],
      due: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  ngOnInit() { }

  back() {
    window.history.back();
  }

  checkValidity(control: string) {
    return this.addInvoiceForm.get(control)?.valid && !this.addInvoiceForm.get(control)?.errors?.['required'] ? 'text-success' : 'text-danger';
  }

  addInvoice() {
    console.log(this.addInvoiceForm.value);
  }

  cancelInvoice() {
    window.history.back();
  }
}
