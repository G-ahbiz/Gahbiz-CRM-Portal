import { Component, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LockPasswordComponent } from '../lock-password/lock-password.component';
import { COUNTRIES } from '../../config/constants';

let uniqueCounter = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LockPasswordComponent],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  // Common props
  @Input() label = '';
  @Input() placeholder = '';
  @Input() id = '';
  @Input() asterisk = '';
  @Input() asteriskColorDanger = 'text-danger';
  @Input() asteriskColorSuccess = 'text-success';
  @Input() isInvalid = false;
  @Input() errorMessage = '';
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() pattern?: string;

  /** new: variant controls behavior */
  @Input() variant: 'text' | 'password' | 'phone' = 'text';

  @Output() valueChange = new EventEmitter<string>();

  // Shared state
  value = '';
  showPassword = false;
  disabled = false;

  // Phone-specific
  countries = COUNTRIES;
  selectedCountry = this.countries[0];
  phoneNumber = '';
  isOpen = false;
  errorId = '';

  constructor() {
    if (!this.id) {
      uniqueCounter++;
      this.id = `input-${Date.now()}-${uniqueCounter}`;
    }
    this.errorId = `${this.id}-error`;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.phone-dropdown-wrapper');
    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  // --- CVA glue ---
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';

    if (this.variant === 'phone') {
      if (!value) {
        this.phoneNumber = '';
        return;
      }
      const match = this.countries.find((c) => value.startsWith(c.dialCode));
      if (match) {
        this.selectedCountry = match;
        this.phoneNumber = value.slice(match.dialCode.length);
      } else {
        this.phoneNumber = value;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // --- Emit changes ---
  emitChange(value: string) {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }

  // --- Phone logic ---
  toggleDropdown(event?: MouseEvent) {
    event?.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectCountry(c: any) {
    if (this.disabled) return;
    this.selectedCountry = c;
    this.isOpen = false;
    this.updatePhone();
    this.onTouched();
  }

  updatePhone() {
    this.phoneNumber = (this.phoneNumber ?? '').replace(/\D/g, '');
    const fullNumber = `${this.selectedCountry.dialCode}${this.phoneNumber}`;
    this.emitChange(fullNumber);
  }

  onPhoneInput(event: any) {
    if (this.disabled) return;
    this.phoneNumber = event.target.value.replace(/\D/g, '');
    this.updatePhone();
  }

  onInputChange(newValue: string) {
    if (this.variant === 'phone') {
      this.phoneNumber = newValue.replace(/\D/g, '');
      this.updatePhone();
    } else {
      this.emitChange(newValue);
    }
  }

  handleBlur() {
    this.onTouched();
  }
}
