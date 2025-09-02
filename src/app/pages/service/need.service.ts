import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Need {
  id: number;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class NeedService {
  private baseEndpoint = 'needs';

  constructor(private api: ApiService, private http: HttpClient) {}

  getAllNeeds(): Observable<Need[]> {
    return this.api.get<Need[]>(`${this.baseEndpoint}/all`);
  }

  getNeedById(id: number): Observable<Need> {
    return this.api.get<Need>(`${this.baseEndpoint}/${id}`);
  }
}
