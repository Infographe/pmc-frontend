import { Component, ChangeDetectorRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';  
import { PredictionService } from '../../services/prediction.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectionStrategy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faTrash, faSpinner, faDownload, faSun, faMoon, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Ajout de cette ligne
Chart.register(...registerables);

export interface PredictionData {
  [key: string]: any;
}


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

@Component({
  selector: 'app-prediction-form',
  templateUrl: './prediction-form.component.html',
  styleUrls: ['./prediction-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSlideToggleModule,  
    FontAwesomeModule
  ]
})



export class PredictionFormComponent implements OnInit, AfterViewInit {
  // Variables globales
  selectedModel: string = "ml"; // Par défaut, le modèle ML est sélectionné
  errorMessage: string | null = null;
  historiquePredictions: PredictionData[] = []; // Liste pour stocker l'historique des prédictions
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<PredictionData>([]);
  isLoading = false;
  // filtersEnabled = false;
  predictionResult = [];
  prediction: any;  // Déclare la variable pour stocker le résultat de l'API

  // Définition manuelle des 30 features avec plages de validation
  allFeatures = [
    { name: 'Cyclepds', min: 1, max: 120 },
    { name: 'region', min: 10, max: 50 },
    { name: 'dept', min: 80, max: 180 },
    { name: 'annee', min: 50, max: 250 },
    { name: 'mois', min: 100, max: 300 },
    { name: 'pm10', min: 2, max: 250 },
    { name: 'carbon_monoxide', min: 4, max: 12 },
    { name: 'poids_moyen', min: 0, max: 1 },
    { name: 'regime_special', min: 0, max: 1 },
    { name: 'p_animal', min: 0, max: 1 },
    { name: 'agglo9', min: 50, max: 150 },
    { name: 'entrerep', min: 50, max: 150 },
    { name: 'fastfood', min: 60, max: 200 },
    { name: 'ozone', min: 20, max: 80 },
    { name: 'dip', min: 50, max: 200 },
    { name: 'sulphur_dioxide', min: 50, max: 300 },
    { name: 'temps_act_phy', min: 0, max: 7 },
    { name: 'sedentaire', min: 1, max: 10 },
    { name: 'sexeps', min: 3, max: 12 },
    { name: 'vistes_medecins', min: 50, max: 120 },
    { name: 'pm2_5', min: 12, max: 30 },
    { name: 'taille', min: 90, max: 180 },
    { name: 'IMC', min: 60, max: 120 },
    { name: 'situ_prof', min: 35, max: 40 },
    { name: 'grass_pollen', min: 90, max: 100 },
    { name: 'enrich', min: 0, max: 7 },
    { name: 'heur_trav', min: 1, max: 10 },
    { name: 'situ_mat', min: 1, max: 10 },
    { name: 'nitrogen_dioxide', min: 1, max: 10 },
    { name: 'fqvpo', min: 1, max: 10 }
  ];


  formGroup!: FormGroup;


  // icônes
  faSearch = faSearch;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faDownload = faDownload;
  faSun = faSun;
  faMoon = faMoon;

  // inputs et filtres
  formData: PredictionData = {};
  inputsVisible: boolean = true;
  selectedTab: number = 0;
  
  // Catégories des features
  featuresMain = this.allFeatures.slice(0, 10);
  featuresSecondary = this.allFeatures.slice(10, 20);
  featuresOthers = this.allFeatures.slice(20, 30);

  // pagination et le tri
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.displayedColumns = [...new Set(this.allFeatures.map(f => f.name)), 'prediction']; // Suppression des doublons
    this.dataSource = new MatTableDataSource<PredictionData>(this.historiquePredictions); // Correction ici
    
    console.log("Initialisation du composant");
    this.dataSource.data = this.historiquePredictions;
    console.log("Contenu du tableau au démarrage :", this.dataSource.data);

    this.initForm();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Vérifier si les canvases existent bien après chargement
    const ctx1 = document.getElementById('predictionChart');
    const ctx2 = document.getElementById('predictionHistogram');
    
    console.log("Vérification des canvases après chargement :", ctx1, ctx2);
  }
  

  initForm() {
    const controls: { [key: string]: FormControl } = {};
    this.allFeatures.forEach(feature => {
      controls[feature.name] = new FormControl('', [
        Validators.required,
        Validators.min(feature.min),
        Validators.max(feature.max)
      ]);
    });
    this.formGroup = new FormGroup(controls);
  }
  
  toggleInputs() {
    this.inputsVisible = !this.inputsVisible;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  // Séparer les données ML et DL
  mlFeatures = [];
  dlFeatures = [];
  selectedModelType = "ml";  // Par défaut

  getFeatureValues() {
    return this.selectedModelType === "ml" ? this.mlFeatures : this.dlFeatures;
  }

  onModelChange(model: string) {
    this.selectedModelType = model;
    console.log(`Modèle changé : ${model}`);
  }


  // remplir automatiquement les champs
  autoFill() {
    this.allFeatures.forEach(feature => {
      const randomValue = Math.floor(Math.random() * (feature.max - feature.min + 1)) + feature.min;
  
      // Met à jour le FormGroup
      if (this.formGroup.controls[feature.name]) {
        this.formGroup.controls[feature.name].setValue(randomValue);
        this.formGroup.controls[feature.name].markAsTouched();
        this.formGroup.controls[feature.name].updateValueAndValidity();
      }
  
      // Met à jour l'affichage dans formData
      this.formData[feature.name] = randomValue;
    });
    
    console.log("Autofill généré :", this.formGroup.value);

    this.cdr.detectChanges();
  }
  

  envoyerDonnees() {
    if (this.formGroup.invalid || !this.populationSize) {
      this.showNotification('❌ Veuillez remplir tous les champs correctement, y compris la taille de la population exposée.', true);
      return;
    }

    const featuresObject = Object.keys(this.formGroup.controls).reduce((acc, key) => {
      acc[key] = Number(this.formGroup.controls[key].value);
      return acc;
    }, {} as { [key: string]: number });

    this.isLoading = true;
    const inputData = {
      model_type: this.selectedModel?.trim().toLowerCase(),
      features: featuresObject
    };

    this.predictionService.getPrediction(inputData).subscribe({
      next: (response) => {
        console.log("📡 Réponse API :", response);
        if (!response || response.prediction === undefined) {
          console.error("❌ L'API ne retourne pas de prédiction valide !");
          this.showNotification("Erreur : L'API ne retourne pas de prédiction.", true);
          return;
        }

        this.prediction = Number(response.prediction); // ex: 9.56
        this.historiquePredictions.unshift({
          ...featuresObject,
          prediction: this.prediction
        });

        this.dataSource.data = [...this.historiquePredictions]; // ✅ Rafraîchit bien le tableau
        this.calculerEstimation();  // 🔥 Recalculer automatiquement l'affichage
        this.isLoading = false;
        this.cdr.detectChanges();
        this.updateChart();
      },
      error: (error) => {
        console.error('❌ Erreur API :', error);
        this.showNotification("Erreur API : " + error.message, true);
        this.isLoading = false;
      }
    });
  }
  
  
  // Variable pour stocker la taille de la population exposée
  populationSize: number | null = null;
  estimationPopulation: number | null = null;

  // Méthode pour calculer le nombre de personnes affectées
  calculerPersonnesAffetees() {
    if (!this.populationSize || this.populationSize <= 0 || this.historiquePredictions.length === 0) {
      this.estimationPopulation = 0;
      return;
    }
  
    // Récupère la dernière prédiction et la convertit en taux
    const dernierePrediction = this.historiquePredictions[0]['prediction'] / 100;
  
    // Taille de l’échantillon de formation (📌 À adapter selon ton dataset)
    const tailleEchantillon = 1000;
  
    // Calcul proportionnel
    this.estimationPopulation = Math.round((dernierePrediction / tailleEchantillon) * this.populationSize);
  }

  verifierPopulation() {
    if (!this.populationSize || this.populationSize <= 0) {
      this.showNotification("❌ Veuillez entrer une taille de population valide.", true);
    }
  }
  

  estimationAffectes: number = 0;
  predictionPercentage: number = 0;  // Valeur en pourcentage

  calculerEstimation() {
    if (this.prediction !== null && this.populationSize !== null && this.populationSize > 0) {
      // ❗ NE PAS multiplier prediction par 100
      this.predictionPercentage = this.prediction;
      this.estimationAffectes = Math.round(this.prediction / 100 * this.populationSize);
    } else {
      this.predictionPercentage = 0;
      this.estimationAffectes = 0;
    }
  }
  


  

  updateChart() {
    // Vérifier si les canvases existent
    const ctx1 = document.getElementById('predictionChart') as HTMLCanvasElement;
    const ctx2 = document.getElementById('predictionHistogram') as HTMLCanvasElement;
  
    console.log("🎯 Vérification des canvases :", ctx1, ctx2);
    if (!ctx1 || !ctx2) {
      console.warn("⚠️ Les éléments canvas ne sont pas trouvés !");
      return;
    }
  
    // Supprime les anciens graphiques s'ils existent
    [ctx1, ctx2].forEach(ctx => {
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }
    });
  
    // Formater les prédictions avec 2 décimales
    const labels = this.historiquePredictions.map((_, index) => `Prédiction ${index + 1}`);
    const dataValues = this.historiquePredictions.map(pred => Number(pred['prediction']).toFixed(2));
  
    // Évolution des Prédictions
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Évolution des Prédictions',
          data: dataValues,
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    // Histogramme des Prédictions
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Distribution des Prédictions',
          data: dataValues,
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  
    console.log("Graphiques mis à jour !");
    this.cdr.detectChanges(); // Forcer la mise à jour d'Angular
  }

  
  exporterCSV() {
    const header = Object.keys(this.historiquePredictions[0]).join(",");
    const rows = this.historiquePredictions.map(row => Object.values(row).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historique_predictions.csv");
    document.body.appendChild(link);
    link.click();
  }


  exporterExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.historiquePredictions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prédictions");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "historique_predictions.xlsx");
  }

  effacerHistorique() {
    this.historiquePredictions = [];
    this.dataSource.data = [];
    this.showNotification("🗑️ Historique effacé.");
  }

  showNotification(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'OK', { duration: 3000, panelClass: isError ? 'error-snackbar' : 'success-snackbar' });
  }
}

