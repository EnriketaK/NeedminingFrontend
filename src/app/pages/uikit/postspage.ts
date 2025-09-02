import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
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

@Component({
    selector: 'app-posts-page',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, IconField, InputIcon, InputText, TableModule, Toolbar],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" severity="secondary" class="mr-2"  />
                <p-button severity="secondary" label="Delete" icon="pi pi-trash" outlined
                />
            </ng-template>

            <ng-template #end>
                <p-button label="Export" icon="pi pi-upload" severity="secondary"  />
            </ng-template>
        </p-toolbar>

        <div class="flex flex-col">
        <div class="card">
<!--            <div class="font-semibold text-xl">DataView</div>-->

            <div class="flex items-center justify-between">
            <h5 class="m-0">Manage Products</h5>
            <p-iconfield>
                <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Search..." />

                </p-iconfield>
            </div>

            <p-dataview [value]="filteredPosts" [layout]="layout">
                <ng-template #header>
                    <div class="flex justify-end">
                        <p-select-button [(ngModel)]="layout" [options]="options" [allowEmpty]="false">
                            <ng-template #item let-option>
                                <i class="pi " [ngClass]="{ 'pi-bars': option === 'list', 'pi-table': option === 'grid' }"></i>
                            </ng-template>
                        </p-select-button>
                    </div>
                </ng-template>

                <ng-template #list let-items>
                    <div class="flex flex-col">
                        <div *ngFor="let item of items; let i = index">
                            <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" [ngClass]="{ 'border-t border-surface': i !== 0 }">
<!--                                <div class="md:w-40 relative">-->
<!--                                    <img class="block xl:block mx-auto rounded w-full" src="https://primefaces.org/cdn/primevue/images/product/{{ item.image }}" [alt]="item.name" />-->
<!--                                    <div class="absolute bg-black/70 rounded-border" [style]="{ left: '4px', top: '4px' }">-->
<!--&lt;!&ndash;                                        <p-tag [value]="item.inventoryStatus" [severity]="getSeverity(item)"></p-tag>&ndash;&gt;-->
<!--                                    </div>-->
<!--                                </div>-->
                                <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">
<!--                                    <div class="flex flex-row md:flex-col justify-between items-start gap-2">-->
                                        <div>
                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.submissionId }}</span>
                                            <div class="text-lg font-medium mt-2">{{ item.title }}</div>
                                            <div class="text-lg font-medium mt-2">{{ item.text }}</div>
                                        </div>

                                        <div class="bg-surface-100 p-1" style="border-radius: 30px">
                                            <div
                                                class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                                                style="
                                                    border-radius: 30px;
                                                    box-shadow:
                                                        0px 1px 2px 0px rgba(0, 0, 0, 0.04),
                                                        0px 1px 2px 0px rgba(0, 0, 0, 0.06);
                                                "
                                            >
                                                <span class="text-surface-900 font-medium text-sm">{{ item.submissionId }}</span>
                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col md:items-end gap-8">
                                        <span class="text-surface-500 dark:text-surface-400 text-sm">Uploaded on: {{ item.uploadedAt | date: 'yyyy-MM-dd HH:mm'}}</span>
                                        <div class="flex flex-row-reverse md:flex-row gap-2">
                                            <p-button icon="pi pi-heart" styleClass="h-full" [outlined]="true"></p-button>
                                            <p-button icon="pi pi-shopping-cart" label="Buy Now" [disabled]="item.inventoryStatus === 'OUTOFSTOCK'" styleClass="flex-auto md:flex-initial whitespace-nowrap"></p-button>
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
    providers: [PostService]
})
export class PostsPage {
    layout: 'list' | 'grid' = 'list';

    options = ['list', 'grid'];

    posts: Post[] = [];
    filteredPosts: Post[] = [];

    constructor(private postService: PostService) {}

    ngOnInit() {
        this.postService.getAllPosts().subscribe((data) => {
            this.posts = data;
            this.filteredPosts = [...data];
        });
    }

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredPosts = this.posts.filter(post =>
            post.submissionId?.toLowerCase().includes(query) ||
            post.title?.toLowerCase().includes(query) ||
            post.text?.toLowerCase().includes(query)
        );
    }

}
