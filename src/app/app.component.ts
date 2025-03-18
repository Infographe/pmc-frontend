import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // ✅ À conserver
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PredictionService, PredictionData } from './services/prediction.service';
import { PredictionFormComponent } from './components/prediction-form/prediction-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    CommonModule,  // ✅ Remplace `BrowserModule`
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
  selectedModelType: string = "ml";  // ✅ Par défaut, modèle ML sélectionné

  constructor(private predictionService: PredictionService) {}

  envoyerDonnees() {
    const inputData: PredictionData = { 
      feature1: 1.5, 
      feature2: 3.2, 
      feature3: 2.1, 
      feature4: 4.5, 
      feature5: 0.9 
    };

    console.log("📡 Envoi des données avec modèle :", this.selectedModelType);
    console.log("🔍 Features envoyées :", inputData);

    this.predictionService.getPrediction(inputData, this.selectedModelType).subscribe({
      next: (response) => {
        console.log("✅ Réponse reçue :", response);
        this.prediction = response;
      },
      error: (error) => {
        console.error("❌ Erreur API :", error);
      }
    });
  }
}
