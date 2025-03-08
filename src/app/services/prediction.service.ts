import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PredictionData {
  feature1: number;
  feature2: number;
  feature3: number;
  feature4: number;
  feature5: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private apiUrl = `${environment.apiUrl}/predict`;

  constructor(private http: HttpClient) {}

  getPrediction(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
