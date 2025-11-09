import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-leads-add',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './leads-add.html',
  styleUrl: './leads-add.css',
})
export class LeadsAdd implements OnInit {

  addLeadForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addLeadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      service: ['', [Validators.required]],
      source: ['', [Validators.required]],
      status: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      value: ['', [Validators.required]],
      createdDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
    });
  }

  ngOnInit() { }

  checkValidity(control: string) {
    return this.addLeadForm.get(control)?.valid && !this.addLeadForm.get(control)?.errors?.['required'] ? 'text-success' : 'text-danger';
  }

  checkErrors(control: string) {
    return this.addLeadForm.get(control)?.errors && this.addLeadForm.get(control)?.touched;
  }

  back() {
    window.history.back();
  }

  saveLead() {
    console.log(this.addLeadForm.value);
  }

  cancel() {
    window.history.back();
  }
}
