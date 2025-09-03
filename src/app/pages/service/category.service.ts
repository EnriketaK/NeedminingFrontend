import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Post } from '@/pages/service/post.service';

export interface Category {
  id: number;
  title: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseEndpoint = 'categories';

  constructor(private api: ApiService, private http: HttpClient) {}


  getAllCategories(): Observable<Category[]> {
    return this.api.get<Category[]>(`${this.baseEndpoint}/all`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.api.get<Category>(`${this.baseEndpoint}/get/${id}`);
  }

  createCategory(title: string, color: string): Observable<Category> {
    return this.api.post<Category>(`${this.baseEndpoint}/create`, { title, color });
  }

  deleteCategoryById(id: number): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/delete/${id}`);
  }

  updateCategoryTitle(id: number, newTitle: string): Observable<void> {
    return this.api.patch<void>(`${this.baseEndpoint}/update-title/${id}`, newTitle);
  }

  searchCategoryByTitle(keyword: string): Observable<Category[]> {
    return this.api.get<Category[]>(`${this.baseEndpoint}/search/title?keyword=${keyword}`);
  }

  getCategoriesByNeedId(needId: number): Observable<Category[]> {
    return this.api.get<Category[]>(`${this.baseEndpoint}/need/${needId}`);
  }

}
