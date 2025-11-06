import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-add-order',
  imports: [TranslateModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css',
})
export class AddOrder implements OnInit {

  addOrderForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addOrderForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneCode: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      services: ['', Validators.required]
    });
  }


  ngOnInit() { }

  goBack() {
    window.history.back();
  }

  checkValidity(control: string) {
    return this.addOrderForm.get(control)?.valid && !this.addOrderForm.get(control)?.errors?.['required'] ? 'text-success' : 'text-danger';
  }
}
