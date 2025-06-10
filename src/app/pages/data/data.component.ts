import { Component, OnInit, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ActivityItem {
  id: number;
  title: string;
  time: string;
  cost: number;
  icon: string;
}

interface ApiResponse {
  data: ActivityItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

@Component({
  selector: 'app-data',
  imports: [MatIconModule, TranslateModule, BottomNavComponent, CommonModule, MatProgressSpinnerModule],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent implements OnInit {

  // Signals para manejo de estado
  displayedActivities = signal<ActivityItem[]>([]);
  isLoading = signal(false);
  hasMoreData = signal(true);
  currentPage = signal(0);

  private readonly ITEMS_PER_PAGE = 10;

  // Simulación de datos de API - objeto único con toda la data
  private readonly API_DATA: ActivityItem[] = [
    { id: 1, title: 'Plaza Tapatía', time: 'Hace 30 min • 1h 15min', cost: 25, icon: 'local_parking' },
    { id: 2, title: 'Mercado San Juan', time: 'Hace 1 hora • 45min', cost: 18, icon: 'local_parking' },
    { id: 3, title: 'Centro Magno', time: 'Hace 2 horas • 2h 30min', cost: 40, icon: 'local_parking' },
    { id: 4, title: 'Galerías Guadalajara', time: 'Hace 3 horas • 1h', cost: 32, icon: 'local_parking' },
    { id: 5, title: 'Plaza del Sol', time: 'Ayer • 1h 45min', cost: 28, icon: 'local_parking' },
    { id: 6, title: 'Parque Agua Azul', time: 'Ayer • 30min', cost: 15, icon: 'local_parking' },
    { id: 7, title: 'Expo Guadalajara', time: 'Hace 2 días • 3h', cost: 45, icon: 'local_parking' },
    { id: 8, title: 'Teatro Degollado', time: 'Hace 2 días • 2h 15min', cost: 35, icon: 'local_parking' },
    { id: 9, title: 'Palacio de Gobierno', time: 'Hace 3 días • 1h 30min', cost: 22, icon: 'local_parking' },
    { id: 10, title: 'Universidad de Guadalajara', time: 'Hace 3 días • 4h', cost: 20, icon: 'local_parking' },
    { id: 11, title: 'Hospital Civil', time: 'Hace 4 días • 2h', cost: 30, icon: 'local_parking' },
    { id: 12, title: 'Estadio Akron', time: 'Hace 4 días • 3h 30min', cost: 50, icon: 'local_parking' },
    { id: 13, title: 'Arena VFG', time: 'Hace 5 días • 2h 45min', cost: 42, icon: 'local_parking' },
    { id: 14, title: 'Plaza Patria', time: 'Hace 5 días • 1h 20min', cost: 26, icon: 'local_parking' },
    { id: 15, title: 'Forum Tlaquepaque', time: 'Hace 6 días • 2h 10min', cost: 38, icon: 'local_parking' },
    { id: 16, title: 'Centro Joyero', time: 'Hace 6 días • 45min', cost: 16, icon: 'local_parking' },
    { id: 17, title: 'Mercado Libertad', time: 'Hace 1 semana • 1h 5min', cost: 19, icon: 'local_parking' },
    { id: 18, title: 'Tlaquepaque Centro', time: 'Hace 1 semana • 1h 50min', cost: 24, icon: 'local_parking' },
    { id: 19, title: 'Tonalá Centro', time: 'Hace 1 semana • 2h 20min', cost: 21, icon: 'local_parking' },
    { id: 20, title: 'Plaza Concentro', time: 'Hace 1 semana • 1h 35min', cost: 29, icon: 'local_parking' },
    { id: 21, title: 'Andares Shopping', time: 'Hace 2 semanas • 3h 15min', cost: 55, icon: 'local_parking' },
    { id: 22, title: 'La Gran Plaza', time: 'Hace 2 semanas • 2h 5min', cost: 33, icon: 'local_parking' },
    { id: 23, title: 'Plaza Universidad', time: 'Hace 2 semanas • 1h 40min', cost: 27, icon: 'local_parking' },
    { id: 24, title: 'Centro Histórico', time: 'Hace 2 semanas • 1h 25min', cost: 23, icon: 'local_parking' },
    { id: 25, title: 'Chapultepec Centro', time: 'Hace 2 semanas • 2h 35min', cost: 31, icon: 'local_parking' },
    { id: 26, title: 'Multiplaza del Sol', time: 'Hace 3 semanas • 1h 15min', cost: 25, icon: 'local_parking' },
    { id: 27, title: 'Plaza México', time: 'Hace 3 semanas • 2h', cost: 34, icon: 'local_parking' },
    { id: 28, title: 'Centro Magno Sur', time: 'Hace 3 semanas • 1h 55min', cost: 37, icon: 'local_parking' },
    { id: 29, title: 'Plaza Vallarta', time: 'Hace 3 semanas • 1h 10min', cost: 20, icon: 'local_parking' },
    { id: 30, title: 'Galerías Vallarta', time: 'Hace 3 semanas • 2h 25min', cost: 39, icon: 'local_parking' },
    { id: 31, title: 'Plaza Bonita', time: 'Hace 1 mes • 1h 30min', cost: 22, icon: 'local_parking' },
    { id: 32, title: 'Centro Comercial Midtown', time: 'Hace 1 mes • 2h 40min', cost: 41, icon: 'local_parking' },
    { id: 33, title: 'Plaza Cibeles', time: 'Hace 1 mes • 1h 20min', cost: 24, icon: 'local_parking' },
    { id: 34, title: 'Soriana Hiper', time: 'Hace 1 mes • 45min', cost: 17, icon: 'local_parking' },
    { id: 35, title: 'Walmart Supercenter', time: 'Hace 1 mes • 1h 5min', cost: 18, icon: 'local_parking' },
    { id: 36, title: 'Costco Wholesale', time: 'Hace 1 mes • 1h 35min', cost: 26, icon: 'local_parking' },
    { id: 37, title: 'Sam\'s Club', time: 'Hace 1 mes • 1h 45min', cost: 28, icon: 'local_parking' },
    { id: 38, title: 'Home Depot', time: 'Hace 1 mes • 2h 10min', cost: 32, icon: 'local_parking' },
    { id: 39, title: 'Liverpool', time: 'Hace 1 mes • 1h 50min', cost: 30, icon: 'local_parking' },
    { id: 40, title: 'El Palacio de Hierro', time: 'Hace 1 mes • 2h 15min', cost: 36, icon: 'local_parking' },
    { id: 41, title: 'Sears', time: 'Hace 1 mes • 1h 25min', cost: 23, icon: 'local_parking' },
    { id: 42, title: 'Fabricas de Francia', time: 'Hace 1 mes • 1h 40min', cost: 27, icon: 'local_parking' },
    { id: 43, title: 'Suburbia', time: 'Hace 1 mes • 1h 15min', cost: 21, icon: 'local_parking' },
    { id: 44, title: 'Coppel', time: 'Hace 1 mes • 50min', cost: 19, icon: 'local_parking' },
    { id: 45, title: 'Elektra', time: 'Hace 1 mes • 1h 10min', cost: 20, icon: 'local_parking' },
    { id: 46, title: 'Office Depot', time: 'Hace 1 mes • 1h 30min', cost: 25, icon: 'local_parking' },
    { id: 47, title: 'Best Buy', time: 'Hace 1 mes • 2h 5min', cost: 33, icon: 'local_parking' },
    { id: 48, title: 'RadioShack', time: 'Hace 1 mes • 35min', cost: 14, icon: 'local_parking' },
    { id: 49, title: 'GamePlanet', time: 'Hace 1 mes • 1h 20min', cost: 22, icon: 'local_parking' },
    { id: 50, title: 'Cinépolis', time: 'Hace 1 mes • 3h', cost: 45, icon: 'local_parking' }
  ];

  ngOnInit() {
    this.loadMoreItems();
  }

  // Simulación de llamada a API
  private async simulateApiCall(page: number, limit: number): Promise<ApiResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const data = this.API_DATA.slice(startIndex, endIndex);

    return {
      data,
      total: this.API_DATA.length,
      page,
      hasMore: endIndex < this.API_DATA.length
    };
  }

  async loadMoreItems() {
    if (this.isLoading() || !this.hasMoreData()) return;

    this.isLoading.set(true);

    try {
      const response = await this.simulateApiCall(this.currentPage(), this.ITEMS_PER_PAGE);

      const currentItems = this.displayedActivities();
      this.displayedActivities.set([...currentItems, ...response.data]);
      this.hasMoreData.set(response.hasMore);
      this.currentPage.update(page => page + 1);

    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

    if (atBottom && this.hasMoreData() && !this.isLoading()) {
      this.loadMoreItems();
    }
  }
}
