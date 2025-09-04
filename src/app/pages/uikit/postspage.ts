import { CommonModule } from '@angular/common';
import { Component,ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule,DataViewPageEvent } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import {Post, PostService } from '@/pages/service/post.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import {Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import {FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router,RouterModule } from '@angular/router';
import { Menubar } from 'primeng/menubar';

@Component({
    selector: 'app-posts-page',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, IconField, InputIcon, InputText, TableModule, Toolbar, FileUploadModule, ToastModule, RouterModule, Menubar],
    template: ` <p-toast />
        <div class="mb-6">
            <div class="col-span-full lg:col-span-12">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Upload Posts</div>
                    <p-fileupload #advancedUploader name="files" customUpload (uploadHandler)="onUpload($event, advancedUploader)" [multiple]="true" accept=".json" maxFileSize="1000000" mode="advanced">
                        <ng-template #empty>
                            <div>Choose JSON files containing posts to upload.</div>
                        </ng-template>
                    </p-fileupload>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Posts Overview</div>
                <p-menubar [model]="nestedMenuItems">
                    <ng-template #end>
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />
                        </p-iconfield>
                    </ng-template>
                </p-menubar>

                <p-dataview
                    #dataView
                    [first]="firstPage"
                    (onPage)="onPage($event)"
                    [totalRecords]="filteredPosts.length"
                    [value]="filteredPosts"
                    [layout]="layout"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[5, 10, 20, 50]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} posts"
                    [showCurrentPageReport]="true"
                >
                    <ng-template #list let-items>
                        <div class="flex flex-col">
                            <div *ngFor="let item of items; let i = index">
                                <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" [ngClass]="{ 'border-t border-surface': i !== 0 }">
                                    <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                        <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                            <div>
                                                <div class="font-medium text-surface-500 dark:text-surface-400 text-sm block">Uploaded on: {{ item.uploadedAt | date: 'yyyy-MM-dd HH:mm' }}</div>
                                                <div class="text-l font-bold mt-2">{{ item.title }}</div>
                                                <div class="text-l font-medium mt-2">{{ item.text }}</div>
                                            </div>

                                            <div class="p-1">
                                                <p-button [routerLink]="['/uikit', 'postdetail', item.id]" styleClass="flex-auto md:flex-initial whitespace-nowrap">
                                                    Go to post
                                                    <i class="pi pi-arrow-right"></i>
                                                </p-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </p-dataview>
            </div>
        </div>`,
    styles: `
        ::ng-deep {
            .p-orderlist-list-container {
                width: 100%;
            }
        }
    `,
    providers: [MessageService]
})
export class PostsPage {
    layout: 'list' | 'grid' = 'list';

    posts: Post[] = [];
    filteredPosts: Post[] = [];

    uploadedFiles: any[] = [];

    globalFilter: string = '';

    firstPage = 0;
    sortDescending: boolean = true;

    nestedMenuItems = [
        {
            label: 'Sort by date',
            icon: 'pi pi-fw pi-sort-alt',
            command: () => this.toggleSortByDate()
        }
    ];

    constructor(
        private postService: PostService,
        private messageService: MessageService,
        public router: Router
    ) {}

    ngOnInit() {
        this.loadPosts();
    }

    loadPosts() {
        this.postService.getAllPosts().subscribe((data) => {
            this.posts = [...data].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            this.filteredPosts = [...this.posts];
            this.sortDescending = true;

            this.firstPage = 0;
        });
    }

    toggleSortByDate() {
        this.sortDescending = !this.sortDescending;
        this.sortPosts();
    }

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredPosts = this.posts.filter((post) => post.submissionId?.toLowerCase().includes(query) || post.title?.toLowerCase().includes(query) || post.text?.toLowerCase().includes(query));
        this.sortPosts();
    }

    onPage(event: DataViewPageEvent) {
        this.firstPage = event.first;
    }

    private sortPosts() {
        const direction = this.sortDescending ? -1 : 1;

        this.filteredPosts.sort((a, b) => direction * (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()));
        this.filteredPosts = [...this.filteredPosts];

        this.firstPage = 0;
    }

    onUpload(event: { files: File[] }, uploader: FileUpload) {
        const files: File[] = event.files;

        this.postService.uploadPosts(files).subscribe({
            next: (posts) => {
                this.uploadedFiles = [];
                uploader.clear();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Uploaded ${posts.length} post(s)` });
                this.globalFilter = '';
                this.loadPosts();
            }
            //fix BE for error throwing when no posts were uploaded or smth, coz no errors are thrown
            // ,
            // error: (err) => {
            //     this.messageService.add({ severity: 'error', summary: 'Upload failed', detail: 'Files could not be uploaded' });
            //     console.error('Upload error:', err);
            // }
        });
    }
}
