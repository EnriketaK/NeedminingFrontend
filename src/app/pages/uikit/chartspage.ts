import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../layout/service/layout.service';
import { Category, CategoryService } from '../service/category.service';
import { Tab,TabList,Tabs } from 'primeng/tabs';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Menubar } from 'primeng/menubar';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-charts-page',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, Tab, IconField, InputIcon, InputText, Menubar, Tabs, TabList, FormsModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Charts</div>
            <p-tabs [value]="activeTab" (valueChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab [value]="0">Pie</p-tab>
                    <p-tab [value]="1">Doughnut</p-tab>
                </p-tablist>
            </p-tabs>

            <div *ngIf="activeTab === 0" class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Distribution of Categories</div>
                <p-chart type="pie" [data]="pieData" [options]="pieOptions"></p-chart>
            </div>

            <div *ngIf="activeTab === 1" class="card flex flex-col items-center">
                <div class="font-semibold text-xl mb-4">Distribution of Categories</div>
                <p-chart type="doughnut" [data]="pieData" [options]="pieOptions"></p-chart>
            </div>
        </div>
    `
})
export class ChartsPage {
    pieData: any;
    pieOptions: any;
    subscription: Subscription;
    activeTab: string | number = 0;

    constructor(
        private layoutService: LayoutService,
        private categoryService: CategoryService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.updateChartOptions();
        });
    }

    ngOnInit() {
        this.loadCategoryData();
    }

    loadCategoryData() {
        this.categoryService.getAllCategories().subscribe({
            next: (categories: Category[]) => {
                const labels = categories.map((c) => c.title);
                const data = categories.map((c) => c.needsCount);
                const backgroundColor = categories.map((c) => c.color);

                this.pieData = {
                    labels,
                    datasets: [
                        {
                            data,
                            backgroundColor,
                            hoverBackgroundColor: backgroundColor
                        }
                    ]
                };

                this.updateChartOptions();
            },
            error: (err) => {
                console.error('Fetching categories for chart failed due to:', err);
            }
        });
    }


    updateChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.pieOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem: any) => {
                            const dataset = tooltipItem.dataset;
                            const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                            const value = dataset.data[tooltipItem.dataIndex];
                            const percentge = ((value / total) * 100).toFixed(1);
                            const label = this.pieData.labels[tooltipItem.dataIndex];

                            return `${label}: ${value} (${percentge}%)`;
                        }
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onTabChange(index: string | number) {
        this.activeTab = index;
    }
}
