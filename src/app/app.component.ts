import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // À conserver
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PredictionService, Features } from './services/prediction.service';
import { PredictionFormComponent } from './components/prediction-form/prediction-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    CommonModule,  // Remplace `BrowserModule`
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSliderModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    PredictionFormComponent
  ],
  providers: [PredictionService],
  styleUrls: ['./app.component.css'],
  standalone: true // 🚀 Ajout nécessaire pour un projet standalone
})
export class AppComponent {
  prediction: any;
  selectedModelType: string = "ml";  // Par défaut, modèle ML sélectionné
  formGroup!: FormGroup; // Déclare formGroup pour éviter l'erreur

  constructor(private predictionService: PredictionService) {}

  envoyerDonnees() {
    const data: Features = {
      Cyclepds: 88,
      region: 26,
      dept: 180,
      annee: 93,
      mois: 259,
      pm10: 29,
      carbon_monoxide: 6,
      poids_moyen: 0,
      regime_special: 0,
      p_animal: 1,
      agglo9: 72,
      entrerep: 78,
      fastfood: 111,
      ozone: 66,
      dip: 156,
      sulphur_dioxide: 251,
      temps_act_phy: 6,
      sedentaire: 6,
      sexeps: 10,
      vistes_medecins: 60,
      pm2_5: 30,
      taille: 106,
      IMC: 119,
      situ_prof: 35,
      grass_pollen: 90,
      enrich: 1,
      heur_trav: 2,
      situ_mat: 2,
      nitrogen_dioxide: 9,
      fqvpo: 9
    };
    

    console.log("Envoi des données avec modèle :", this.selectedModelType);
    console.log("Features envoyées :", data);

    const inputData = {
      model_type: this.selectedModelType?.trim().toLowerCase(), // Correction
      features: Object.keys(this.formGroup.value).reduce((acc, key) => {
          acc[key] = Number(this.formGroup.value[key]);
          return acc;
      }, {} as { [key: string]: number })
    };
  
  
    
    this.predictionService.getPrediction(inputData).subscribe({
      next: (response) => {
        console.log("Réponse API :", response);
      },
      error: (error) => {
        console.error("Erreur API :", error);
      }
    });   
    
    
  }
}
