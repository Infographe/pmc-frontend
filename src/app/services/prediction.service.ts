import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

// ✅ Interface correspondant aux features attendues par l'API
export interface Features {
  Cyclepds: number;
  region: number;
  dept: number;
  annee: number;
  mois: number;
  pm10: number;
  carbon_monoxide: number;
  poids_moyen: number;
  regime_special: number;
  p_animal: number;
  agglo9: number;
  entrerep: number;
  fastfood: number;
  ozone: number;
  dip: number;
  sulphur_dioxide: number;
  temps_act_phy: number;
  sedentaire: number;
  sexeps: number;
  vistes_medecins: number;
  pm2_5: number;
  taille: number;
  IMC: number;
  situ_prof: number;
  grass_pollen: number;
  enrich: number;
  heur_trav: number;
  situ_mat: number;
  nitrogen_dioxide: number;
  fqvpo: number;
}


// ✅ Interface du format de la requête envoyée à FastAPI
export interface PredictionRequest {
  model_choice: string;  // "ml" ou "dl"
  features: Features;    // Un objet contenant les features
}

// ✅ Interface du format de la réponse attendue
export interface PredictionResponse {
  prediction: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  // private apiUrl = `${environment.apiUrl}`;
  private apiUrl = `https://pmc-backend-q5dn.onrender.com`;
  // private apiUrl = `http://localhost:8000`;

  constructor(private http: HttpClient) {}

  /**
   * 🔥 Envoi des données pour obtenir une prédiction
   * @param features Données des features sous forme d'objet
   * @param modelType Type de modèle à utiliser ("ml" ou "dl")
   * @returns Observable contenant la prédiction
   */
  getPrediction(data: { model_type: string; features: { [key: string]: number } }): Observable<any> {
    console.log("📡 Envoi des données à l'API :", data); // Debug
  
    return this.http.post<any>(`${this.apiUrl}/predict`, data).pipe(
      tap(response => console.log("📥 Réponse de l'API :", response)), // Debug
      catchError(this.handleError)
    );
  }

    

  /**
   * 🛠 Gestion des erreurs HTTP
   * @param error Objet d'erreur retourné par l'API
   * @returns Observable qui lève une erreur formatée
   */
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
