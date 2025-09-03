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
import { MessageService } from 'primeng/api';
import { Chip } from 'primeng/chip';
import {Router, RouterLink,RouterModule } from '@angular/router';
import {Category, CategoryService } from '@/pages/service/category.service';
import { ColorPicker } from 'primeng/colorpicker';
import { Post } from '@/pages/service/post.service';

@Component({
    selector: 'app-categories-page',
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
        ColorPicker
    ],
    template: `
        <p-toast />
        <div class="mb-6">
            <div class="col-span-full lg:col-span-12">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Create Category</div>

                    <div class="flex flex-wrap items-start gap-6">



                                            <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-2">
                                                <label for="name" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Name</label>
                                                <div class="col-span-12 md:col-span-10">
                                                    <input
                                                      pInputText
                                                      id="name"
                                                      type="text"
                                                      [(ngModel)]="categoryName"
                                                      [ngClass]="{ 'ng-dirty ng-invalid': isNameInvalid }"
                                                    />

                                                </div>
                                            </div>
                                            <div class="grid grid-cols-12 gap-2 grid-cols-12 gap-2">
                                                <label for="colorPicker" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Tag Color</label>
                                                <div class="col-span-12 md:col-span-10">
                                                    <p-colorpicker id="colorPicker" [style]="{ width: '2rem' }" [(ngModel)]="colorValue" />
                                                </div>
                                            </div>
                                            <p-button label="Submit" (onClick)="submitCategory()" [fluid]="false"></p-button>

                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="card">
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Categories Overview</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />
                    </p-iconfield>
                </div>


                            <div class="flex flex-wrap gap-2 mt-2">
                                <p-tag
                                    *ngFor="let category of filteredCategories"
                                    [style]="{
                                        'background-color': category.color,
                                        color: getTextColor(category.color)
                                    }"
                                    rounded
                                    class="text-surface-900 font-medium text-sm"
                                >
                                    {{ category.title }}
                                    <i class="pi pi-times cursor-pointer" (click)="onDeleteCategory(category.id, $event)" title="Delete category"></i>
                                </p-tag>
                            </div>

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
export class CategoriesPage {

    categories: Category[] = [];

    filteredCategories: Category[] = [];

    globalFilter: string = '';

    colorValue: string = '#1976D2';

    categoryName: string = '';

    isNameInvalid: boolean = false;

    constructor(
        private messageService: MessageService,
        private categoryService: CategoryService) {}

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAllCategories().subscribe({
            next: (data) => {
                this.categories = data;
                this.filteredCategories = [...data];
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load categories'
                });
            }
        });
    }

    onDeleteCategory(id: number, event: MouseEvent) {
        event.stopPropagation();
        this.categoryService.deleteCategoryById(id).subscribe({
            next: () => {
                this.categories = this.categories.filter(c => c.id !== id);
                this.filteredCategories = this.filteredCategories.filter(c => c.id !== id);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Category deleted successfully'
                });
            },
            error: (err) => {
                console.error('Error deleting category:', err);
                // this.messageService.add({
                //     severity: 'error',
                //     summary: 'Error',
                //     detail: 'Failed to delete category'
                // });
            }
        });
    }

    submitCategory() {
        this.isNameInvalid = !this.categoryName || this.categoryName.trim().length === 0;
        if (this.isNameInvalid) {
            return;
        }

        this.categoryService.createCategory(this.categoryName, this.colorValue)
        .subscribe({
            next: (newCategory) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Category "${newCategory.title}" created successfully`,
                });
                this.categoryName = '';
                this.colorValue = '#1976D2';
                this.isNameInvalid = false;
                this.globalFilter = '';
                this.loadCategories();
            },
            error: (err) => {
                console.error('Error creating category:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create category',
                });
            }
        });
    }


    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredCategories = this.categories.filter((category) => category.title?.toLowerCase().includes(query));
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
