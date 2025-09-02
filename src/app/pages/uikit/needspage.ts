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

@Component({
    selector: 'app-needs-page',
    standalone: true,
    imports: [CommonModule, DataViewModule, FormsModule, SelectButtonModule, PickListModule, OrderListModule, TagModule, ButtonModule, IconField, InputIcon, InputText, TableModule, Toolbar, FileUploadModule, ToastModule],
    template: ` <p-toast />

        <div class="flex flex-col">
            <div class="card">
                <!--            <div class="font-semibold text-xl">DataView</div>-->

                <div class="flex items-center justify-between">
                    <h5 class="m-0">Needs Overview</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Search..." />
                    </p-iconfield>
                </div>

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
                                                <div class="relative w-full shadow-sm">
                                                    <img class="rounded w-full" src="https://primefaces.org/cdn/primevue/images/product/{{ item.image }}" [alt]="item.name" />
                                                    <div
                                                        class="absolute bg-black/70 rounded-border"
                                                        [style]="{
                                                            left: '4px',
                                                            top: '4px'
                                                        }"
                                                    >
<!--                                                        <p-tag [value]="item.inventoryStatus" [severity]="getSeverity(item)"></p-tag>-->
                                                    </div>
                                                </div>
                                                <div class="pt-12">
                                                    <div class="flex flex-row justify-between items-start gap-2">
                                                        <div>
                                                            <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ item.category }}</span>
                                                            <div class="text-lg font-medium mt-1">
                                                                {{ item.content }}
                                                            </div>
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
                                                                <span class="text-surface-900 font-medium text-xs">{{ item.rating }}</span>
                                                                <i class="pi pi-star-fill text-yellow-500"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="flex flex-col gap-6 mt-6">
                                                        <span class="text-2xl font-semibold">$ {{ item.price }}</span>
                                                        <div class="flex gap-2">
                                                            <p-button icon="pi pi-shopping-cart" label="Buy Now" [disabled]="item.inventoryStatus === 'OUTOFSTOCK'" class="flex-auto whitespace-nowrap" styleClass="w-full"></p-button>
                                                            <p-button icon="pi pi-heart" styleClass="h-full" [outlined]="true"></p-button>
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
    providers: [MessageService, NeedService]
})
export class NeedsPage {
    layout: 'list' | 'grid' = 'grid';

    needs: Need[] = [];
    filteredNeeds: Need[] = [];

    uploadedFiles: any[] = [];

    globalFilter: string = '';

    firstPage = 0;

    constructor(
        private needService: NeedService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadNeeds();
    }

    loadNeeds() {
        this.needService.getAllNeeds().subscribe((data) => {
            this.needs = data;
            this.filteredNeeds = [...data];

            this.firstPage = 0;
        });
    }

    onGlobalFilter(event: Event) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredNeeds = this.needs.filter((need) =>
        need.content?.toLowerCase().includes(query));

        this.firstPage = 0;
    }

    onPage(event: DataViewPageEvent) {
        this.firstPage = event.first;
    }
}
