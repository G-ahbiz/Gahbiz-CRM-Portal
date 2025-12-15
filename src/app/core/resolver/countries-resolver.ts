import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { LocationsService } from '@core/services/locations.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountriesResolver implements Resolve<any> {

  constructor(private locations: LocationsService) {}

  resolve(): Observable<any> {
    return this.locations.getAllCountries$();
  }
}
