import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import {Post, PostService } from '@/pages/service/post.service';

@Component({
    selector: 'app-upload-page',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ToastModule, ButtonModule],
    template: `
        <p-toast />
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-full lg:col-span-12">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Upload Posts (Advanced)</div>
                        <p-fileupload
                        #advancedUploader
                        name="files"
                        customUpload
                        (uploadHandler)="onUpload($event, advancedUploader)"
                        [multiple]="true"
                        accept=".json"
                        maxFileSize="1000000"
                        mode="advanced">
                        <ng-template #empty>
                            <div>Drag and drop JSON files here to upload.</div>
                        </ng-template>
                    </p-fileupload>
                </div>
            </div>

        </div>`,
    providers: [MessageService, PostService]
})
export class UploadPage {
    uploadedFiles: any[] = [];

    constructor(
        private messageService: MessageService,
        private postService: PostService
    ) {}

    onUpload(event: { files: File[] }, uploader: FileUpload) {
        const files: File[] = event.files;


        this.postService.uploadPosts(files).subscribe({
            next: (posts) => {
                this.uploadedFiles = [];
                uploader.clear();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: `Uploaded ${posts.length} post(s)` });
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
