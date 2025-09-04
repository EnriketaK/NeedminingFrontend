import { Component,ElementRef,OnDestroy,QueryList,ViewChildren } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import {Button, ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import {Textarea, TextareaModule } from 'primeng/textarea';
import {ActivatedRoute, RouterModule } from '@angular/router';
import { Subject,switchMap,takeUntil } from 'rxjs';
import {Need, NeedService } from '@/pages/service/need.service';
import { Post,PostService } from '@/pages/service/post.service';
import { Tag,TagModule } from 'primeng/tag';
import {CommonModule, DatePipe } from '@angular/common';
import { Menu } from 'primeng/menu';
import {MenuItem, MessageService } from 'primeng/api';
import { SplitButton } from 'primeng/splitbutton';
import { Toast } from 'primeng/toast';
import { Category,CategoryService } from '@/pages/service/category.service';

@Component({
    selector: 'app-post-detail',
    standalone: true,
    imports: [InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, TextareaModule, RouterModule, Tag, DatePipe, CommonModule, TagModule, Menu, SplitButton, Toast],
    template: `
  <p-toast />
        <p-fluid>
            <div class="flex flex-col md:flex-row gap-8">
                <div class="md:w-1/2">
                    <div class="card flex flex-col gap-4">
                        <div class="font-semibold text-xl mb-4">Post Detail</div>

                        <div>
                            <div *ngIf="post">
                                <div class="font-medium text-surface-500 dark:text-surface-400 text-sm block">Uploaded on: {{ post.uploadedAt | date: 'yyyy-MM-dd HH:mm' }}</div>
                                <div class="text-l font-bold mt-2">{{ post.title }}</div>
                                <div class="text-l font-medium mt-2">{{ post.text }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="md:w-1/2">
                    <div class="card flex flex-col gap-4">
                        <div class="font-semibold text-xl">Needs</div>

                        <div *ngIf="needs.length === 0">No needs available for this post.</div>

                        <div class="flex gap-2">
                            <p-button label="AI Needmine" icon="pi pi-bolt" (click)="onExtractNeeds()" />
                        </div>

                        <div *ngFor="let need of needs" class="p-4 border rounded mb-2">
                            <div class="font-medium text-surface-500 dark:text-surface-400 text-sm block mb-4">Created on: {{ need.uploadedAt | date: 'yyyy-MM-dd HH:mm' }}</div>

                            <textarea
                                pTextarea
                                [(ngModel)]="need.content"
                                (ngModelChange)="resizeOne(needTextarea)"
                                autoResize="true"
                                [rows]="1"
                                class="w-full text-surface-900 border-none shadow-none overflow-hidden"
                                [readonly]="!editingNeeds[need.id]"
                                style="resize: none; overflow: hidden;"
                                #needTextarea
                            ></textarea>

                            <div class="flex flex-wrap gap-2 mt-2">
                                <p-tag
                                    *ngFor="let category of need.categories"
                                    [style]="{
                                        'background-color': category.color,
                                        color: getTextColor(category.color)
                                    }"
                                    rounded
                                    class="text-surface-900 font-medium text-sm"
                                >
                                    {{ category.title }}
                                    <i class="pi pi-times cursor-pointer" (click)="onRemoveCategory(need, category.id, $event)" title="Remove category"></i>
                                </p-tag>
                            </div>

                            <div class="flex flex-wrap gap-2 mt-2">
                                <p-button *ngIf="!need.isAccepted" label="Accept" (click)="onAcceptNeed(need.id)" />

                                <p-button *ngIf="!editingNeeds[need.id]" label="Edit" (click)="onStartEdit(need)"></p-button>

                                <p-splitbutton *ngIf="editingNeeds[need.id]" label="Save" (onClick)="onSaveEdit(need)" [model]="trackEditMenuByNeed[need.id]"></p-splitbutton>

                                <p-menu #menu [popup]="true" [model]="allCategories"></p-menu>

                                <button *ngIf="need.isAccepted" type="button" pButton (click)="onShowCategoryMenu(need, menu, $event)" style="width:auto">
                                    Categorize
                                    <i class="pi pi-chevron-down"></i>
                                </button>

                                <p-button label="Delete" severity="danger" (click)="onDeleteNeed(need.id)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </p-fluid>`,
    providers: [MessageService]
})
export class PostDetail implements OnDestroy {
    post!: Post;
    needs: Need[] = [];
    editingNeeds: { [needId: number]: boolean } = {};

    allCategories: { label: string; command: () => void }[] = [];
    selectedNeedForCat!: Need;

    private destroy$ = new Subject<void>();

    @ViewChildren('needTextarea', { read: ElementRef })
    textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

    private ogNeedText: { [needId: number]: string } = {};
    trackEditMenuByNeed: Record<number, MenuItem[]> = {};

    constructor(
        private postService: PostService,
        private needService: NeedService,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private categoryService: CategoryService
    ) {}

    ngOnInit() {
        this.route.paramMap
            .pipe(
                takeUntil(this.destroy$),
                switchMap((params) => {
                    const id = Number(params.get('id'));
                    return this.postService.getPostById(id);
                })
            )
            .subscribe((post) => {
                this.post = post;
                this.loadNeeds();
            });

        this.categoryService.getAllCategories().subscribe({
            next: (categories) => {
                this.allCategories = categories.map((cat) => ({
                    label: cat.title,
                    command: () => this.assignCategory(this.selectedNeedForCat, cat.id)
                }));
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

    ngAfterViewInit() {
        setTimeout(() => this.resizeAll());
        this.textareas.changes.subscribe(() => this.resizeAll());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadNeeds() {
        if (!this.post?.id) return;
        this.needService
            .getNeedsByPostId(this.post.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((needs) => {
                needs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
                this.needs = [...needs.filter((n) => !n.isAccepted), ...needs.filter((n) => n.isAccepted)];

                this.editingNeeds = {};
                setTimeout(() => this.resizeAll());
            });
    }

    onExtractNeeds() {
        if (!this.post?.id) return;

        this.needService
            .extractNeedOfPost(this.post.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadNeeds();
                },
                error: (err) => {
                    console.error('Error extracting the need:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to extract need. Please try again'
                    });
                }
            });
    }

    onAcceptNeed(needId: number) {
        this.needService
            .updateIsAccepted(needId, true)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadNeeds();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Need is accepted successfully'
                    });
                },
                error: (err) => {
                    console.error('Error accepting need:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to accept need'
                    });
                }
            });
    }

    onDeleteNeed(needId: number) {
        this.needService
            .deleteNeedById(needId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadNeeds();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Need is deleted successfully'
                    });
                },
                error: (err) => {
                    console.error('Error deleting need:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete need'
                    });
                }
            });
    }

    onStartEdit(need: Need) {
        this.editingNeeds[need.id] = true;
        this.ogNeedText[need.id] = need.content;

        //just in case
        setTimeout(() => this.resizeAll());

        this.trackEditMenuByNeed[need.id] = [
            {
                label: 'Discard changes',
                command: () => this.onDiscardChanges(need)
            }
        ];
    }

    onSaveEdit(need: Need) {
        this.onToggleEdit(need);
    }

    onDiscardChanges(need: Need) {
        if (this.ogNeedText.hasOwnProperty(need.id)) {
            need.content = this.ogNeedText[need.id];
        }
        delete this.editingNeeds[need.id];
        delete this.ogNeedText[need.id];
        delete this.trackEditMenuByNeed[need.id];
        setTimeout(() => this.resizeAll());
    }

    onToggleEdit(need: Need) {
        // const isEditing = this.editingNeeds[need.id];

        // if (isEditing) {
        this.needService
            .editContent(need.id, need.content.trim())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    delete this.editingNeeds[need.id];
                    delete this.ogNeedText[need.id];
                    delete this.trackEditMenuByNeed[need.id];
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Need updated successfully'
                    });
                    this.loadNeeds();
                },
                error: (err) => {
                    console.error('Error saving content:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update need'
                    });
                }
            });
        // } else {
        //   // optional if its still used somewhere else
        //   this.onStartEdit(need);
        // }
    }

    onShowCategoryMenu(need: Need, menu: any, event: MouseEvent) {
        this.selectedNeedForCat = need;
        menu.toggle(event);
    }

    assignCategory(need: Need, categoryId: number) {
        this.needService
            .assignCategoryToNeed(need.id, categoryId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadNeeds();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Category added',
                        detail: 'The category was successfully added to the need.'
                    });
                },
                error: (err) => {
                    console.error('Error adding category:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to add category'
                    });
                }
            });
    }

    onRemoveCategory(need: Need, categoryId: number, event?: MouseEvent) {
        event?.stopPropagation();

        const prevCategories = [...need.categories];
        need.categories = need.categories.filter((c) => c.id !== categoryId);

        this.needService
            .removeCategoryFromNeed(need.id, categoryId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
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

    getTextColor(hex: string): string {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminance <= 186 ? 'white' : 'black';
    }

    resizeAll() {
        this.textareas?.forEach((ref) => this.resizeOne(ref));
    }

    resizeOne(refOrEl: ElementRef<HTMLTextAreaElement> | HTMLTextAreaElement | null | undefined) {
        const el = refOrEl instanceof ElementRef ? refOrEl.nativeElement : refOrEl;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }
}
