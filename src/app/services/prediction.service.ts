import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
export interface PredictionData {
  feature1: number;
  feature2: number;
  feature3: number;
  feature4: number;
  feature5: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  // private apiUrl = `${environment.apiUrl}`;
  private apiUrl = `http://localhost:8000`;

  constructor(private http: HttpClient) {}


  getPrediction(data: any, modelType: string): Observable<any> {
    const payload = { ...data, model_type: modelType }; // Ajoute model_type au payload
    console.log("📡 Envoi des données à l'API :", payload); // Debug

    return this.http.post<any>(`${this.apiUrl}/predict`, payload).pipe(
        tap(response => console.log("📥 Réponse de l'API :", response)), // Debug
        catchError(this.handleError)
    );
}


  // ✅ Ajout de la gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error("❌ Erreur API :", error);

    let errorMessage = "Erreur inconnue";
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur côté client : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur serveur (Code: ${error.status}) : ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

}
