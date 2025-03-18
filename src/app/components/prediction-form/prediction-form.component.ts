import { Component, ChangeDetectorRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { faSearch, faTrash, faSpinner, faDownload, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';

// graphiques Chart.js
Chart.register(...registerables);

export interface PredictionData {
  [key: string]: any;
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
  filtersEnabled = false;
  predictionResult = [];
  prediction: any;  // ✅ Déclare la variable pour stocker le résultat de l'API

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

  // themeSombre = false;
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
  filterFeatures: { [key: string]: string } = {};
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    console.log("🚀 Initialisation du composant");
    this.dataSource.data = this.historiquePredictions;
    console.log("🔍 Contenu du tableau au démarrage :", this.dataSource.data);

    this.initForm();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    console.log("📌 Paginator & Sort initialisés");
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

  toggleFilters() {
    this.filtersEnabled = !this.filtersEnabled;
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
    console.log(`🚀 Modèle changé : ${model}`);
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
  
    this.cdr.detectChanges();
  }
  

  envoyerDonnees() {
    if (this.formGroup.invalid) {
      this.showNotification('❌ Veuillez remplir tous les champs correctement.', true);
      return;
    }

    const featuresArray = this.allFeatures.map(f => this.formGroup.value[f.name]);
    const inputData = {
      model_type: this.selectedModel,
      features: featuresArray
    };

    this.isLoading = true;
    this.predictionService.getPrediction(inputData, this.selectedModel).subscribe({
      next: (response) => {
        const newPrediction = { ...this.formGroup.value, prediction: response.prediction };
        this.historiquePredictions.unshift(newPrediction);
        this.dataSource.data = [...this.historiquePredictions];
        this.isLoading = false;
        this.cdr.detectChanges();
        this.updateChart();
      },
      error: (error) => {
        console.error('❌ Erreur API :', error);
        this.isLoading = false;
      }
    });
  }

  

updateChart() {
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
      // console.log("🔄 Suppression de l'ancien graphique sur :", ctx.id);
      existingChart.destroy();
    }
  });

  const labels = this.historiquePredictions.map((_, index) => `Prédiction ${index + 1}`);
  const dataValues = this.historiquePredictions.map(pred => pred['prediction']);

  // Évolution des prédictions
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
    options: { responsive: true }
  });

  // Histogramme des prédictions
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
    options: { responsive: true }
  });

  console.log("✅ Graphiques mis à jour !");
}



  applyFilter() {
    this.dataSource.data = this.historiquePredictions.filter(entry =>
      this.displayedColumns.every(col => 
        !this.filterFeatures[col] || entry[col]?.toString().includes(this.filterFeatures[col])
      )
    );
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
