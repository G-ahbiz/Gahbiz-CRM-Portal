import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Country } from '@core/interfaces/country';
import { State } from '@core/interfaces/state';
import { City } from '@core/interfaces/city'; 
import { environment } from '@env/environment';
import { map, Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  readonly baseUrl = environment.baseApi;

  private countries$: Observable<Country[]> | null = null;
  private statesCache = new Map<string, Observable<State[]>>();
  private citiesCache = new Map<string, Observable<City[]>>(); // Add cities cache

  constructor(private http: HttpClient) {}

  getAllCountries$(): Observable<Country[]> {
    if (!this.countries$) {
      const params = new HttpParams().set('pageNumber', '1').set('pageSize', '1000');
      const url = `${environment.baseApi}${environment.locations.getAllCountries}`;
      this.countries$ = this.http.get<any>(url, { params }).pipe(
        map((response) => response?.data?.items ?? []),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.countries$;
  }

  getStatesByCountry$(countryId: string): Observable<State[]> {
    if (!countryId) return of([]);
    if (!this.statesCache.has(countryId)) {
      const params = new HttpParams().set('pageNumber', '1').set('pageSize', '10000');
      const url = `${environment.baseApi}${environment.locations.getAllStates(countryId)}`;
      const obs = this.http.get<any>(url, { params }).pipe(
        map((res) => res?.data?.items ?? []),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.statesCache.set(countryId, obs);
    }
    return this.statesCache.get(countryId)!;
  }

  // Add method to get cities by stateId
  getCitiesByState$(stateId: string): Observable<City[]> {
    if (!stateId) return of([]);
    if (!this.citiesCache.has(stateId)) {
      const params = new HttpParams().set('pageNumber', '1').set('pageSize', '10000');
      const url = `${environment.baseApi}${environment.locations.getAllCities(stateId)}`;
      const obs = this.http.get<any>(url, { params }).pipe(
        map((res) => res?.data?.items ?? []),
        shareReplay({ bufferSize: 1, refCount: true })
      );
      this.citiesCache.set(stateId, obs);
    }
    return this.citiesCache.get(stateId)!;
  }

  findCountryByName$(name: string) {
    return this.getAllCountries$().pipe(
      map((list) => list.find((c) => c.name === name || c.shortName === name) ?? null)
    );
  }
}
