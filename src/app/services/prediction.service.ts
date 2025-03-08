import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionData {
  feature1: number;
  feature2: number;
  feature3: number;
  feature4: number;
  feature5: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private apiUrl = 'http://127.0.0.1:8000/predict';  // Assure-toi que ça pointe bien sur le bon endpoint

  constructor(private http: HttpClient) {}
  getPrediction(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
