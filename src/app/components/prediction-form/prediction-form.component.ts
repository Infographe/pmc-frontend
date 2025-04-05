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

  populationSize: number | null = null; // Ajouté pour éviter erreur TS2531

  // Définition manuelle des 30 features avec plages de validation
  allFeatures = [
    { name: 'Cyclepds', min: 1, max: 120 },
    {
      name: 'region',
      min: 1,
      max: 99,
      default: 8, // Normandie
      options: [
        { label: 'Auvergne-Rhône-Alpes', value: 1,regionCode: 1 },
        { label: 'Bourgogne-Franche-Comté', value: 2,regionCode: 2 },
        { label: 'Bretagne', value: 3,regionCode: 3 },
        { label: 'Centre-Val de Loire', value: 4,regionCode: 4 },
        { label: 'Grand Est', value: 5,regionCode: 5 },
        { label: 'Hauts-de-France', value: 6,regionCode: 6 },
        { label: 'Ile-de-France', value: 7,regionCode: 7 },
        { label: 'Normandie', value: 8,regionCode: 8 },
        { label: 'Nouvelle-Aquitaine', value: 9,regionCode: 9 },
        { label: 'Occitanie', value: 10,regionCode: 10},
        { label: 'Pays de la Loire', value: 11,regionCode: 11},
        { label: 'Provence Alpes Côte d’Azur', value: 12,regionCode: 12 },
      ]
    },
    { name: 'dept',
      min: 1,
      max: 999,
      default: 76, // Seine-Maritime
      options: [
        { label: '01 - Ain', value: 1, regionCode: 1 },
        { label: '02 - Aisne', value: 2, regionCode: 6 },
        { label: '03 - Allier', value: 3, regionCode: 1 },
        { label: '04 - Alpes de Haute-Provence', value: 4, regionCode: 10 },
        { label: '05 - Hautes-Alpes', value: 5, regionCode: 12 },
        { label: '06 - Alpes-Maritimes', value: 6, regionCode: 12 },
        { label: '07 - Ardêche', value: 7, regionCode: 1 },
        { label: '08 - Ardennes', value: 8, regionCode: 5 },
        { label: '09 - Ariège', value: 9, regionCode: 10 },
        { label: '10 - Aube', value: 10, regionCode: 5 },
        { label: '11 - Aude', value: 11, regionCode: 10 },
        { label: '12 - Aveyron', value: 12, regionCode: 10 },
        { label: '13 - Bouches-du-Rhône', value: 13, regionCode: 12 },
        { label: '14 - Calvados', value: 14, regionCode: 8 },
        { label: '15 - Cantal', value: 15, regionCode: 1 },
        { label: '16 - Charente', value: 16, regionCode: 9 },
        { label: '17 - Charente-Maritime', value: 17, regionCode: 9 },
        { label: '18 - Cher', value: 18, regionCode: 4 },
        { label: '19 - Corrèze', value: 19, regionCode: 9 },
        { label: '21 - Côte-d\'or', value: 21, regionCode: 2 },
        { label: '22 - Côtes d\'Armor', value: 22, regionCode: 3 },
        { label: '23 - Creuse', value: 23, regionCode: 9 },
        { label: '24 - Dordogne', value: 24, regionCode: 9 },
        { label: '25 - Doubs', value: 25, regionCode: 2 },
        { label: '26 - Drôme', value: 26, regionCode: 1 },
        { label: '27 - Eure', value: 27, regionCode: 8 },
        { label: '28 - Eure-et-Loir', value: 28, regionCode: 4 },
        { label: '29 - Finistère', value: 29, regionCode: 3 },
        { label: '30 - Gard', value: 30, regionCode: 10 },
        { label: '31 - Haute-Garonne', value: 31, regionCode: 10 },
        { label: '32 - Gers', value: 32, regionCode: 10 },
        { label: '33 - Gironde', value: 33, regionCode: 9 },
        { label: '34 - Hérault', value: 34, regionCode: 10 },
        { label: '35 - Ille-et-Vilaine', value: 35, regionCode: 3 },
        { label: '36 - Indre', value: 36, regionCode: 4 },
        { label: '37 - Indre-et-Loire', value: 37, regionCode: 4 },
        { label: '38 - Isère', value: 38, regionCode: 1 },
        { label: '39 - Jura', value: 39, regionCode: 2 },
        { label: '40 - Landes', value: 40, regionCode: 9 },
        { label: '41 - Loir-et-Cher', value: 41, regionCode: 4 },
        { label: '42 - Loire', value: 42, regionCode: 1 },
        { label: '43 - Haute-Loire', value: 43, regionCode: 1 },
        { label: '44 - Loire-Atlantique', value: 44, regionCode: 11 },
        { label: '45 - Loiret', value: 45, regionCode: 4 },
        { label: '46 - Lot', value: 46, regionCode: 10 },
        { label: '47 - Lot-et-Garonne', value: 47, regionCode: 9 },
        { label: '48 - Lozère', value: 48, regionCode: 10 },
        { label: '49 - Maine-et-Loire', value: 49, regionCode: 11 },
        { label: '50 - Manche', value: 50, regionCode: 8 },
        { label: '51 - Marne', value: 51, regionCode: 5 },
        { label: '52 - Haute-Marne', value: 52, regionCode: 5 },
        { label: '53 - Mayenne', value: 53, regionCode: 11 },
        { label: '54 - Meurthe-et-Moselle', value: 54, regionCode: 5 },
        { label: '55 - Meuse', value: 55, regionCode: 5 },
        { label: '56 - Morbihan', value: 56, regionCode: 3 },
        { label: '57 - Moselle', value: 57, regionCode: 5 },
        { label: '58 - Nièvre', value: 58, regionCode: 2 },
        { label: '59 - Nord', value: 59, regionCode: 6 },
        { label: '60 - Oise', value: 60, regionCode: 6 },
        { label: '61 - Orne', value: 61, regionCode: 8 },
        { label: '62 - Pas-de-Calais', value: 62, regionCode: 6 },
        { label: '63 - Puy-de-Dôme', value: 63, regionCode: 1 },
        { label: '64 - Pyrénées-Atlantiques', value: 64, regionCode: 9 },
        { label: '65 - Hautes-Pyrénées', value: 65, regionCode: 10 },
        { label: '66 - Pyrénées-Orientales', value: 66, regionCode: 10 },
        { label: '67 - Bas-Rhin', value: 67, regionCode: 5 },
        { label: '68 - Haut-Rhin', value: 68, regionCode: 5 },
        { label: '69 - Rhône', value: 69, regionCode: 1 },
        { label: '70 - Haute-Saône', value: 70, regionCode: 2 },
        { label: '71 - Saône-et-Loire', value: 71, regionCode: 2 },
        { label: '72 - Sarthe', value: 72, regionCode: 11 },
        { label: '73 - Savoie', value: 73, regionCode: 1 },
        { label: '74 - Haute-Savoie', value: 74, regionCode: 1 },
        { label: '75 - Paris', value: 75, regionCode: 7},
        { label: '76 - Seine-Maritime', value: 76, regionCode: 8 },
        { label: '77 - Seine-et-Marne', value: 77, regionCode: 7 },
        { label: '78 - Yvelines', value: 78, regionCode: 7 },
        { label: '79 - Deux-Sèvres', value: 79, regionCode: 9 },
        { label: '80 - Somme', value: 80, regionCode: 6 },
        { label: '81 - Tarn', value: 81, regionCode: 10 },
        { label: '82 - Tarn-et-Garonne', value: 82, regionCode: 10 },
        { label: '83 - Var', value: 83, regionCode: 12 },
        { label: '84 - Vaucluse', value: 84, regionCode: 12 },
        { label: '85 - Vendée', value: 85, regionCode: 11 },
        { label: '86 - Vienne', value: 86, regionCode: 9 },
        { label: '87 - Haute-Vienne', value: 87, regionCode: 9 },
        { label: '88 - Vosges', value: 88, regionCode: 5 },
        { label: '89 - Yonne', value: 89, regionCode: 2 },
        { label: '90 - Territoire de Belfort', value: 90, regionCode: 2 },
        { label: '91 - Essonne', value: 91, regionCode: 7 },
        { label: '92 - Hauts-de-Seine', value: 92, regionCode: 7},
        { label: '93 - Seine-Saint-Denis', value: 93, regionCode: 7 },
        { label: '94 - Val-de-Marne', value: 94, regionCode: 7 },
        { label: '95 - Val-d\'Oise', value: 95, regionCode: 7 },
        // { label: '2A - Corse-du-Sud', value: 201 },
        // { label: '2B - Haute-Corse', value: 202 },
        // { label: '971 - Guadeloupe', value: 971 },
        // { label: '972 - Martinique', value: 972 },
        // { label: '973 - Guyane', value: 973 },
        // { label: '974 - La Réunion', value: 974 },
        // { label: '976 - Mayotte', value: 976 }
      ]
    },
    { name: 'annee', min: 2020, max: 2025 },
    { name: 'mois', min: 1, max: 12 },
    { name: 'pm10', min: 11, max: 30 },
    { name: 'carbon_monoxide', min: 134, max: 273 },
    { name: 'poids_moyen', min: 25, max: 100 },
    { name: 'regime_special', min: 1, max: 20 },
    { name: 'p_animal', min: 1, max: 100 },
    { name: 'agglo9', min: 1, max: 9 },
    { name: 'entrerep', min: 1, max: 9 },
    { name: 'fastfood', min: 1, max: 9 },
    { name: 'ozone', min: 25, max: 70 },
    { name: 'dip', min: 1, max: 14 },
    { name: 'sulphur_dioxide', min: 0.75, max: 3.3 },
    { name: 'temps_act_phy', min: 1, max: 2000 },
    { name: 'sedentaire', min: 1, max: 690 },
    { name: 'sexeps', min: 1, max: 2 },
    { name: 'vistes_medecins', min: 0, max: 100 },
    { name: 'pm2_5', min: 7, max: 21 },
    { name: 'taille', min: 100, max: 195 },
    { name: 'IMC', min: 10, max: 56 },
    { name: 'situ_prof', min: 1, max: 7 },
    { name: 'grass_pollen', min: 0, max: 29 },
    { name: 'enrich', min: 1, max: 5 },
    { name: 'heur_trav', min: 0, max: 99 },
    { name: 'situ_mat', min: 1, max: 6 },
    { name: 'nitrogen_dioxide', min: 11, max: 30 },
    { name: 'fqvpo', min: 1, max: 9 }
  ];


  formGroup!: FormGroup;
  // Liste complète des départements (à extraire de `allFeatures`)
  departements: { label: string; value: number; regionCode: number }[] = this.allFeatures.find(f => f.name === 'dept')?.options || [];

  // Départements filtrés selon la région sélectionnée
  filteredDepartements: { label: string; value: number; regionCode: number }[] = [];
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
    this.displayedColumns = [...new Set(this.allFeatures.map(f => f.name)), 'prediction'];
    this.dataSource = new MatTableDataSource<PredictionData>(this.historiquePredictions);
  
    this.initForm();
    const defaultRegion = this.formGroup.get('region')?.value;
    this.filteredDepartements = this.departements.filter(dep => dep.regionCode === defaultRegion);  
    // 👇 Initialisation des départements selon la région par défaut (ex: Normandie - 8)
    // this.onRegionChange(defaultRegion);
    this.formGroup.get('region')?.setValue(defaultRegion); // Forcer la cohérence
    this.formGroup.get('dept')?.setValue(
      this.getDepartementsForRegion(defaultRegion)[0]?.value || ''
    );
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
      const defaultValue = feature.default !== undefined ? feature.default : '';
      controls[feature.name] = new FormControl(defaultValue, [
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
  // selectedModelType = "ml";  // Par défaut

  get allDepartements(): { label: string; value: number; regionCode: number }[] {
    const deptFeature = this.allFeatures.find(f => f.name === 'dept');
    return (deptFeature?.options || []) as { label: string; value: number; regionCode: number }[];
  }
  
  // Aide
  showAide = false;

  toggleAide() {
    this.showAide = !this.showAide;
  }


  // getFeatureValues() {
  //   return this.selectedModelType === "ml" ? this.mlFeatures : this.dlFeatures;
  // }

  // onModelChange(model: string) {
  //   this.selectedModelType = model;
  //   console.log(`Modèle changé : ${model}`);
  // }

  // Ce tableau contiendra dynamiquement les départements filtrés selon la région choisie
  // departements: { label: string, value: number, regionCode: number }[] = [];

  getDepartementsForRegion(regionCode: number) {
    const deptFeature = this.allFeatures.find(f => f.name === 'dept');
    return deptFeature?.options?.filter((d: any) => d.regionCode === Number(regionCode)) || [];
  }
  
  onRegionChange(selectedRegionCode: number) {
    const allDeptOptions = this.allFeatures.find(f => f.name === 'dept')?.options || [];
    this.filteredDepartements = allDeptOptions.filter(dep => dep.regionCode === selectedRegionCode);
  
    // Réinitialiser le département si sa valeur ne correspond plus à la région
    const currentDept = this.formGroup.get('dept')?.value;
    const isDeptValide = this.filteredDepartements.some(dep => dep.value === currentDept);
  
    if (!isDeptValide) {
      this.formGroup.get('dept')?.setValue(null);
    }
  }
  
  
  
  
  trackByValue(index: number, option: any) {
    return option.value;
  }
  


  // remplir automatiquement les champs
  autoFill() {
    this.allFeatures.forEach(feature => {
      if (feature.options) {
        const current = this.formGroup.controls[feature.name].value;
        const fallback = feature.default ?? '';
        this.formGroup.controls[feature.name].setValue(current || fallback);
      } else {
        const randomValue = Math.floor(Math.random() * (feature.max - feature.min + 1)) + feature.min;
        this.formGroup.controls[feature.name].setValue(randomValue);
      }
      this.formGroup.controls[feature.name].markAsTouched();
      this.formGroup.controls[feature.name].updateValueAndValidity();
    });
  
    const regionVal = this.formGroup.get('region')?.value;
    this.filteredDepartements = this.departements.filter(dep => dep.regionCode === regionVal);
    this.cdr.detectChanges();
  }
  
  

  // Ajout des champs à chaque prédiction
  envoyerDonnees() {
    if (this.formGroup.invalid || this.populationSize === null) {
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
        if (!response || response.prediction === undefined) {
          this.showNotification("Erreur : L'API ne retourne pas de prédiction.", true);
          return;
        }

        this.prediction = Number(response.prediction);
        const personnesEstimees = Math.round(this.prediction / 100 * (this.populationSize ?? 0));

        this.historiquePredictions.unshift({
          ...featuresObject,
          prediction: this.prediction,
          populationSize: this.populationSize,
          personnesEstimees: personnesEstimees
        });

        this.dataSource.data = [...this.historiquePredictions];
        this.calculerEstimation();
        this.isLoading = false;
        this.cdr.detectChanges();
        this.updateChart();
      },
      error: (error) => {
        this.showNotification("Erreur API : " + error.message, true);
        this.isLoading = false;
      }
    });
  }

  
  
  // Variable pour stocker la taille de la population exposée
  // populationSize: number | null = null;
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

  
  // Export CSV mis à jour
  exporterCSV() {
    if (this.historiquePredictions.length === 0) return;

    const header = Object.keys(this.historiquePredictions[0]).join(',');
    const rows = this.historiquePredictions.map(row => Object.values(row).join(','));

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

