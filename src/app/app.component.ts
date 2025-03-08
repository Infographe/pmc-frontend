import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // ✅ À conserver
import { FormsModule } from '@angular/forms';
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

  constructor(private predictionService: PredictionService) {}

  envoyerDonnees() {
    const inputData: PredictionData = { feature1: 1.5, feature2: 3.2, feature3: 2.1, feature4: 4.5, feature5: 0.9 };  // ✅ Toutes les features
    this.predictionService.getPrediction(inputData).subscribe(response => {
      this.prediction = response;
    });
  }
}
