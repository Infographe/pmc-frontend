import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule]
})
export class DashboardComponent {
  @Input() history: { feature1: number, feature2: number, prediction: string }[] = [];

  displayedColumns: string[] = ['feature1', 'feature2', 'prediction'];
}
