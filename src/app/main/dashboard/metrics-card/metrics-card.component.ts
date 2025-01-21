import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metrics-card',
  templateUrl: './metrics-card.component.html'
})
export class MetricsCardComponent {
  @Input() title!: string;
  @Input() value!: number;
  @Input() icon!: string;
  @Input() colorClass!: string;
  @Input() change!: number;
  @Input() trend!: 'up' | 'down' | 'neutral';
  @Input() suffix: string = '';

  getTrendClass(): string {
    return {
      'up': 'text-green-600',
      'down': 'text-red-600',
      'neutral': 'text-gray-600'
    }[this.trend] || 'text-gray-600';
  }

  getTrendIcon(): string {
    return {
      'up': 'ri-arrow-up-line',
      'down': 'ri-arrow-down-line',
      'neutral': 'ri-more-line'
    }[this.trend] || 'ri-more-line';
  }
}