import { CommonModule } from '@angular/common';
import { Component,ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule,DataViewPageEvent } from 'primeng/dataview';
import { OrderListModule } from 'primeng/orderlist';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';
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
import {Category, CategoryService } from '@/pages/service/category.service';
import { ColorPicker } from 'primeng/colorpicker';
import { Post } from '@/pages/service/post.service';
import { Menubar } from 'primeng/menubar';
import { InputGroup } from 'primeng/inputgroup';
import { Checkbox } from 'primeng/checkbox';
import { Fluid } from 'primeng/fluid';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { SplitButton } from 'primeng/splitbutton';
import { Tooltip } from 'primeng/tooltip';
import { Menu } from 'primeng/menu';
import { Rating } from 'primeng/rating';

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
        ColorPicker,
        Menubar,
        Checkbox,
        Fluid,
        InputGroupAddon,
        SplitButton
    ],
    template: ` <p-toast />
        <div class="mb-6">
            <div class="col-span-full lg:col-span-12">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Create Category</div>

                    <div class="flex flex-wrap items-start gap-6">
                        <div class="inline-flex gap-4">
                            <label for="name" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Name</label>
                            <div class="col-span-12 md:col-span-10">
                                <input pInputText id="name" type="text" [(ngModel)]="categoryName" [ngClass]="{ 'ng-dirty ng-invalid': isNameInvalid }" />
                            </div>

                            <label for="colorPicker" class="flex items-center col-span-12 mb-2 md:col-span-2 md:mb-0">Tag Color</label>
                            <div class="col-span-12 md:col-span-10 flex items-center">
                                <p-colorpicker id="colorPicker" [style]="{ width: '2rem' }" [(ngModel)]="colorValue" />
                            </div>
                            <p-button label="Submit" (onClick)="submitCategory()" [fluid]="false"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="card">
                <div class="font-semibold text-xl mb-8">Categories Overview</div>
                <p-menubar [model]="nestedMenuItems">
                    <ng-template #end>
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />
                        </p-iconfield>
                    </ng-template>
                </p-menubar>

                <div class="flex flex-wrap gap-4 mt-4">
                    <ng-container *ngIf="filteredCategories.length > 0; else noCategories">
                        <div class="inline-flex gap-4 p-4 rounded mb-2 items-center border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded" *ngFor="let category of filteredCategories">
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="category.title"
                                [readonly]="!editing[category.id]"
                                placeholder="Category Name"
                                pTooltip="Category Name"
                                style="width: 200px;"
                                [style]="{
                                    'background-color': category.color,
                                    color: getTextColor(category.color)
                                }"
                            />

                            <p-splitbutton
                                severity="secondary"
                                (onClick)="editing[category.id] ? onSaveEdit(category) : onStartEdit(category)"
                                [label]="editing[category.id] ? 'Save' : 'Edit'"
                                [model]="editBtnMenus[category.id]"
                                style="width: 100px;"
                            ></p-splitbutton>
                        </div>
                    </ng-container>

                    <ng-template #noCategories>
                        <div class="text-center w-full text-gray-500 mt-4">No results found</div>
                    </ng-template>
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
    items: MenuItem[] = [];

    editing: { [categoryId: number]: boolean } = {};
    ogTitles: { [categoryId: number]: string } = {};
    editBtnMenus: { [categoryId: number]: MenuItem[] } = {};

    sortDescending: boolean = false;

    nestedMenuItems = [
        {
            label: 'Sort by name',
            icon: 'pi pi-fw pi-sort-alt',
            command: () => this.toggleSortByName()
        }
    ];

    constructor(
        private messageService: MessageService,
        private categoryService: CategoryService
    ) {}

    ngOnInit() {
        this.loadCategories();
        this.items = [{ label: 'Delete', icon: 'pi pi-times' }];
    }

    loadCategories() {
        this.categoryService.getAllCategories().subscribe({
            next: (data) => {
                this.categories = data;
                console.log('data');
                console.log(data);
                this.filteredCategories = [...data];

                for (const cat of data) {
                    if (!this.editing[cat.id]) {
                        this.editBtnMenus[cat.id] = [
                            {
                                label: 'Delete',
                                icon: 'pi pi-trash',
                                command: () => this.onDeleteCategory(cat.id)
                            }
                        ];
                    }
                }
                this.sortCategories();
            },
            error: (err) => {
                console.error('Error loading categories:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Load Failed',
                    detail: 'Failed to load categories'
                });
            }
        });
    }

    submitCategory() {
        this.isNameInvalid = !this.categoryName || this.categoryName.trim().length === 0;
        if (this.isNameInvalid) {
            return;
        }

        this.categoryService.createCategory(this.categoryName.trim(), this.colorValue).subscribe({
            next: (newCategory) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Category "${newCategory.title}" created successfully`
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
                    detail: 'Failed to create category'
                });
            }
        });
    }

    toggleSortByName() {
        this.sortDescending = !this.sortDescending;
        this.sortCategories();
    }

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredCategories = this.categories.filter((category) => category.title?.toLowerCase().includes(query));
        this.sortCategories();
    }

    onStartEdit(category: Category) {
        this.ogTitles[category.id] = category.title;
        this.editing[category.id] = true;

        this.editBtnMenus[category.id] = [
            {
                label: 'Discard changes',
                icon: 'pi pi-times',
                command: () => this.onDiscardChanges(category)
            }
        ];
    }

    onSaveEdit(category: Category) {
        if (!category.title.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Category title cannot be empty'
            });
            return;
        }

        this.categoryService.updateCategoryTitle(category.id, category.title.trim()).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Updated',
                    detail: `Category updated successfully`
                });

                delete this.ogTitles[category.id];
                delete this.editing[category.id];

                this.editBtnMenus[category.id] = [
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        command: () => this.onDeleteCategory(category.id)
                    }
                ];

                this.loadCategories();
            },
            error: (err) => {
                console.error('Error updating category:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update category'
                });
            }
        });
    }

    onDiscardChanges(category: Category) {
        if (this.ogTitles.hasOwnProperty(category.id)) {
            category.title = this.ogTitles[category.id];
        }

        delete this.editing[category.id];
        delete this.ogTitles[category.id];

        this.editBtnMenus[category.id] = [
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => this.onDeleteCategory(category.id)
            }
        ];
    }

    onDeleteCategory(id: number, event?: MouseEvent) {
        if (event) event.stopPropagation();

        this.categoryService.deleteCategoryById(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'Category deleted successfully'
                });
                this.loadCategories();
            },
            error: (err) => {
                console.error('Error deleting category:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete category'
                });
            }
        });
    }

    getTextColor(hex: string): string {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminance <= 186 ? 'white' : 'black';
    }

    private sortCategories() {
        const direction = this.sortDescending ? -1 : 1;
        this.filteredCategories.sort((a, b) => {
            return direction * a.title.localeCompare(b.title);
        });

        this.filteredCategories = [...this.filteredCategories];
    }
}
