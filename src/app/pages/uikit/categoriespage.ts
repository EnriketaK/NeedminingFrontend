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
        ColorPicker,
        Menubar,
        InputGroup,
        Checkbox,
        Fluid,
        InputGroupAddon,
        InputNumber,
        SplitButton,
        Tooltip,
        Menu
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
                            <div class="col-span-12 md:col-span-10">
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
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Categories Overview</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />
                    </p-iconfield>
                </div>

                <div class="flex flex-wrap gap-2 mt-2">
<div
    class="inline-flex gap-4 p-4 border rounded mb-2 items-center"
    *ngFor="let category of filteredCategories"
>
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
                color: getTextColor(category.color),
                'font-weight': 'bold'
            }"
    />

    <p-splitbutton
        (onClick)="editing[category.id] ? onSaveEdit(category) : onStartEdit(category)"
        [label]="editing[category.id] ? 'Save' : 'Edit'"
        [model]="editBtnMenus[category.id]"
        style="width: 100px;"
    ></p-splitbutton>
</div>


                    <div class="inline-flex gap-4 p-4 border rounded mb-2">
                        <input pInputText type="text" placeholder="Category Name" pTooltip="Category Name" />
                        <p-splitbutton label="Edit" [model]="items"></p-splitbutton>
                    </div>
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

    submitCategory() {
        this.isNameInvalid = !this.categoryName || this.categoryName.trim().length === 0;
        if (this.isNameInvalid) {
            return;
        }

        this.categoryService.createCategory(this.categoryName, this.colorValue).subscribe({
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

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredCategories = this.categories.filter((category) => category.title?.toLowerCase().includes(query));
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
}
