// src/app/services/imprest.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Imprest, ImprestDetail, ApiResponse } from '../main/expences/imprest/imprest.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImprestService {
  private baseUrl = `${environment.apiUrl}/imprest`;

  constructor(private http: HttpClient) { }

  getAllImprests(): Observable<ApiResponse<Imprest[]>> {
    return this.http.get<ApiResponse<Imprest[]>>(`${this.baseUrl}/get`);
  }

  getImprestById(id: string): Observable<ApiResponse<ImprestDetail>> {
    return this.http.get<ApiResponse<ImprestDetail>>(`${this.baseUrl}/get/${id}`);
  }

  createImprest(imprest: Imprest): Observable<ApiResponse<Imprest>> {
    return this.http.post<ApiResponse<Imprest>>(`${this.baseUrl}/add`, imprest);
  }

  updateImprest(id: string, imprest: Imprest): Observable<ApiResponse<Imprest>> {
    return this.http.put<ApiResponse<Imprest>>(`${this.baseUrl}/edit/${id}`, imprest);
  }

  deleteImprest(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/delete/${id}`);
  }
}