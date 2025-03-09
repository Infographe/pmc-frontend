import { Component, ChangeDetectorRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  errorMessage: string | null = null;
  historiquePredictions: PredictionData[] = [];
  allFeatures: string[] = [...Array(30).keys()].map(i => `feature${i+1}`);
  displayedColumns: string[] = [...this.allFeatures, 'prediction']; // Afficher toutes les features
  dataSource = new MatTableDataSource<PredictionData>([]);
  isLoading = false;
  filtersEnabled = false;
  themeSombre = false;
  faSearch = faSearch;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faDownload = faDownload;
  faSun = faSun;
  faMoon = faMoon;
  formData: PredictionData = {};
  filterFeatures: { [key: string]: string } = {};

  // Catégorisation des features
  featuresMain = this.allFeatures.slice(0, 10);
  featuresSecondary = this.allFeatures.slice(10, 20);
  featuresOthers = this.allFeatures.slice(20, 30);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.allFeatures.forEach(feature => this.filterFeatures[feature] = '');

    console.log("🚀 Initialisation du composant");
    this.dataSource.data = this.historiquePredictions;
    console.log("🔍 Contenu du tableau au démarrage :", this.dataSource.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    console.log("📌 Paginator & Sort initialisés");
}

  
  toggleFilters() {
    this.filtersEnabled = !this.filtersEnabled;
    this.applyFilter();
  }

  toggleTheme() {
    this.themeSombre = !this.themeSombre;
    document.body.classList.toggle('dark-theme', this.themeSombre);
  }

  autoFill() {
    this.allFeatures.forEach(feature => {
      this.formData[feature] = Math.floor(Math.random() * 100);
    });
  }

  envoyerDonnees() {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();
    
    this.predictionService.getPrediction(this.formData).subscribe(response => {
        this.isLoading = false;
        this.formData['prediction'] = response.prediction;

        const newEntry: PredictionData = { ...this.formData };
        console.log("✅ Nouvelle entrée ajoutée :", newEntry); // Debug ici

        this.historiquePredictions.unshift(newEntry);
        this.dataSource.data = [...this.historiquePredictions];
        console.log("📊 Données mises à jour :", this.dataSource.data); // Debug ici

        this.applyFilter();
        this.updateChart();
        this.showNotification("✅ Prédiction réussie !");
    }, error => {
        this.isLoading = false;
        this.errorMessage = "❌ Erreur lors de la prédiction.";
        this.showNotification("❌ Erreur lors de la prédiction.", true);
    });
}


  updateChart() {
  const ctx1 = document.getElementById('predictionChart') as HTMLCanvasElement;
  const ctx2 = document.getElementById('predictionHistogram') as HTMLCanvasElement;
  
  if (!ctx1 || !ctx2) return;

  // Supprime les anciens graphiques s'ils existent
  [ctx1, ctx2].forEach(ctx => {
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
  });

  const labels = this.historiquePredictions.map((_, index) => `Prédiction ${index + 1}`);
  const dataValues = this.historiquePredictions.map(pred => pred['prediction']);

  // 📊 Évolution des prédictions
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

  // 📈 Histogramme des prédictions
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
