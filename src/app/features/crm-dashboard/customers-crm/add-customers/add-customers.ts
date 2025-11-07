import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-add-customers',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.css',
})
export class AddCustomers implements OnInit {

  addCustomerForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.addCustomerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      nationalId: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      month: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      day: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      year: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      gender: ['', [Validators.required]],
      country: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
      userType: ['', [Validators.required]],
    });
  }

  ngOnInit() { }

  goBack() {
    window.history.back();
  }

  checkValidity(control: string) {
    return this.addCustomerForm.get(control)?.valid && !this.addCustomerForm.get(control)?.errors?.['required'] ? 'text-success' : 'text-danger';
  }

  checkDateOfBirthValidity(): boolean {
    return (this.addCustomerForm.get('month')?.valid && !this.addCustomerForm.get('month')?.errors?.['required']) && (this.addCustomerForm.get('day')?.valid && !this.addCustomerForm.get('day')?.errors?.['required']) && (this.addCustomerForm.get('year')?.valid && !this.addCustomerForm.get('year')?.errors?.['required']) ? true : false;
  }

}
