import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Post {
  id: number;
  submissionId: string;
  title: string;
  text: string;
  uploadedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseEndpoint = 'posts';

  constructor(private api: ApiService, private http: HttpClient) {}

  uploadPosts(files: File[]): Observable<Post[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<Post[]>(`http://localhost:8080/rest-api/${this.baseEndpoint}/upload`, formData);
  }

  getAllPosts(): Observable<Post[]> {
    return this.api.get<Post[]>(`${this.baseEndpoint}/all`);
  }

  getPostById(id: number): Observable<Post> {
    return this.api.get<Post>(`${this.baseEndpoint}/${id}`);
  }

  searchBySubmissionId(keyword: string): Observable<Post[]> {
    return this.api.get<Post[]>(`${this.baseEndpoint}/submission/submissionId?keyword=${keyword}`);
  }

  searchByTitle(keyword: string): Observable<Post[]> {
    return this.api.get<Post[]>(`${this.baseEndpoint}/search/title?keyword=${keyword}`);
  }

  searchByText(keyword: string): Observable<Post[]> {
    return this.api.get<Post[]>(`${this.baseEndpoint}/search/text?keyword=${keyword}`);
  }

  searchByTitleOrText(keyword: string): Observable<Post[]> {
    return this.api.get<Post[]>(`${this.baseEndpoint}/search?keyword=${keyword}`);
  }
}
