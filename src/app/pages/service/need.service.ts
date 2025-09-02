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

export interface Need {
  id: number;
  content: string;
  uploadedAt: string;
  updatedAt: string;
  isAccepted: boolean;
  post: Post;
  categories: Category[];
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


  extractNeedOfPost(postId: number): Observable<Need> {
    return this.api.post(`${this.baseEndpoint}/extract/${postId}`, {});
  }

  getNeedsByPostId(postId: number): Observable<Need[]> {
    return this.api.get<Need[]>(`${this.baseEndpoint}/post/${postId}`);
  }

  deleteNeedById(id: number): Observable<void> {
    return this.api.delete<void>(`${this.baseEndpoint}/delete/${id}`);
  }

  updateIsAccepted(id: number, isAccepted: boolean): Observable<void> {
    const params = new HttpParams().set('isAccepted', isAccepted.toString());
    return this.api.patch<void>(`${this.baseEndpoint}/accept/${id}`, {}, { params });
  }

  editContent(id: number, content: string): Observable<void> {
    return this.api.patch<void>(`${this.baseEndpoint}/edit/${id}`, content);
  }

  assignCategoryToNeed(needId: number, categoryId: number): Observable<void> {
    return this.api.patch<void>(`${this.baseEndpoint}/${needId}/assign-category/${categoryId}`, {});
  }

  removeCategoryFromNeed(needId: number, categoryId: number): Observable<void> {
    return this.api.patch<void>(`${this.baseEndpoint}/${needId}/remove-category/${categoryId}`, {});
  }
}
