import { CommonModule } from '@angular/common';
import { Component,ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule,DataViewPageEvent } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import {Need, NeedService } from '@/pages/service/need.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import {Table, TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';
import {FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import {MenuItem, MessageService } from 'primeng/api';
import { Chip } from 'primeng/chip';
import {Router, RouterLink,RouterModule } from '@angular/router';
import { Timeline } from 'primeng/timeline';
import { takeUntil } from 'rxjs';
import { CategoryService } from '@/pages/service/category.service';
import { Tree } from 'primeng/tree';
import { Menubar } from 'primeng/menubar';
import { SplitButton } from 'primeng/splitbutton';
import { Menu } from 'primeng/menu';

@Component({
    selector: 'app-needs-page',
    standalone: true,
    imports: [
        CommonModule,
        DataViewModule,
        FormsModule,
        SelectButtonModule,
        PickListModule,
        OrderListModule,
        TagModule,
        ButtonModule,
        IconField,
        InputIcon,
        InputText,
        TableModule,
        Toolbar,
        FileUploadModule,
        ToastModule,
        Chip,
        RouterModule,
        Timeline,
        Menu,
        Menubar
    ],
    template: ` <p-toast />
        <div class="flex flex-col">
            <div class="card">
                <div class="font-semibold text-xl mb-4">Needs Overview</div>
                <p-menubar class="mb-4" [model]="nestedMenuItems">
                    <ng-template #end>
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />

                            <button type="button" pButton (click)="onShowFilterMenu($event)" style="width:auto"><i class="pi pi-filter"></i></button>
                        </p-iconfield>

                        <p-menu #filterMenu [popup]="true" [model]="filterItems"></p-menu>
                    </ng-template>
                </p-menubar>

                <p-dataview
                    #dataView
                    [first]="firstPage"
                    (onPage)="onPage($event)"
                    [totalRecords]="filteredNeeds.length"
                    [value]="filteredNeeds"
                    [layout]="layout"
                    [paginator]="true"
                    [rows]="10"
                    [rowsPerPageOptions]="[5, 10, 20, 50]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} needs"
                    [showCurrentPageReport]="true"
                >
                    <ng-template #grid let-items>
                        <div class="grid grid-cols-12 gap-4">
                            <div *ngFor="let item of items; let i = index" class="col-span-12 sm:col-span-6 lg:col-span-4 p-2">
                                <div class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col">
                                    <div class="flex flex-row justify-between items-start gap-2 mb-4">
                                        <div>
                                            <div class="font-medium text-surface-500 dark:text-surface-400 text-sm block mb-4">Last modified: {{ item.updatedAt | date: 'yyyy-MM-dd HH:mm' }}</div>
                                            <div class="text-l font-medium mt-2 mb-2">Post: {{ item.post.title }}</div>
                                            <div class="text-lg font-bold mt-1">
                                                {{ item.content }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-wrap gap-2 mt-2 mb-2">
                                        <p-tag
                                            *ngFor="let category of item.categories"
                                            [style]="{
                                                'background-color': category.color,
                                                color: getTextColor(category.color)
                                            }"
                                            rounded
                                            class="text-surface-900 font-medium text-sm"
                                        >
                                            {{ category.title }}
                                            <i class="pi pi-times cursor-pointer" (click)="onRemoveCategory(item, category.id, $event)" title="Remove category"></i>
                                        </p-tag>
                                    </div>

                                    <div class="p-1">
                                        <p-button severity="secondary" [routerLink]="['/uikit', 'postdetail', item.post.id]" styleClass="flex-auto md:flex-initial whitespace-nowrap">
                                            Go to post
                                            <i class="pi pi-arrow-right"></i>
                                        </p-button>
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
export class NeedsPage {
    layout: 'list' | 'grid' = 'grid';
    needs: Need[] = [];
    filteredNeeds: Need[] = [];
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

    filterOptions: 'content' | 'category' = 'content';
    @ViewChild('filterMenu') filterMenu: any;
    filterItems: MenuItem[] = [
        {
            label: 'Need Content',
            icon: 'pi pi-align-left',
            command: () => {
                this.filterOptions = 'content';
                this.onFilterByOption();
            }
        },
        {
            label: 'Category',
            icon: 'pi pi-tags',
            command: () => {
                this.filterOptions = 'category';
                this.onFilterByOption();
            }
        }
    ];

    constructor(
        private needService: NeedService,
        protected router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadNeeds();
    }

    loadNeeds() {
        this.needService.getAllNeeds().subscribe({
            next: (data) => {
                this.needs = [...data].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                this.filteredNeeds = [...this.needs];
                this.firstPage = 0;
            },
            error: (err) => {
                console.error('Error loading needs:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Load Failed',
                    detail: 'Failed to load needs'
                });
            }
        });
    }

    onShowFilterMenu(event: MouseEvent) {
        this.filterMenu.toggle(event);
    }

    onFilterByOption() {
        const fakeEvent = {
            target: { value: this.globalFilter }
        } as unknown as Event;

        this.onGlobalFilter(fakeEvent);
    }

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();

        if (!query.trim().toLowerCase()) {
            this.filteredNeeds = [...this.needs];
            this.sortPosts();
            return;
        }
        if (this.filterOptions === 'content') {
            this.filteredNeeds = this.needs.filter((need) => need.content?.toLowerCase().includes(query));
        } else if (this.filterOptions === 'category') {
            this.filteredNeeds = this.needs.filter((need) => need.categories.some((cat) => cat.title.toLowerCase().includes(query)));
        }

        this.sortPosts();
    }

    onPage(event: DataViewPageEvent) {
        this.firstPage = event.first;
    }

    onRemoveCategory(need: Need, categoryId: number, event?: MouseEvent) {
        event?.stopPropagation();

        const prevCategories = [...need.categories];
        need.categories = need.categories.filter((c) => c.id !== categoryId);

        this.needService.removeCategoryFromNeed(need.id, categoryId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Category removed',
                    detail: 'The category was removed from the need.'
                });
            },
            error: (err) => {
                console.error('Error removing category:', err);
                need.categories = prevCategories;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to remove category'
                });
            }
        });
    }

    toggleSortByDate() {
        this.sortDescending = !this.sortDescending;
        this.sortPosts();
    }

    private sortPosts() {
        const direction = this.sortDescending ? -1 : 1;

        this.filteredNeeds.sort((a, b) => direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()));
        this.filteredNeeds = [...this.filteredNeeds];

        this.firstPage = 0;
    }

    getTextColor(hex: string): string {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminance <= 186 ? 'white' : 'black';
    }
}
