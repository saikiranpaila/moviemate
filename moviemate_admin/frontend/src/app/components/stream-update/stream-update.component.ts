import { Component, EventEmitter, Input, OnInit, Output, ViewChild, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../services/backend.service';
import { ToastComponent } from '../toast/toast.component';
import { Movie } from '../../models/Movies';

@Component({
  selector: 'app-stream-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stream-update.component.html',
  styleUrl: './stream-update.component.scss'
})
export class StreamUpdateComponent implements OnInit {

  @Input({ alias: 'movieID', required: true }) movieID!: string
  @Input({ alias: 'isTrailer', required: true }) isTrailer!: boolean
  @Input({ alias: 'isMovie', required: true }) isMovie!: boolean
  @Input({ alias: 'movie', required: true }) movie!: Movie
  @Input('toast') toast!: ToastComponent;

  @Output('back') back = new EventEmitter<boolean>();
  file: File | null = null;
  fileName!: string;
  uploadId?: string;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  abortController: AbortController | null = null;

  trailerURLFormControl!: FormControl
  movieFormControl!: FormControl
  trailerURLFormGroup!: FormGroup
  movieFormGroup!: FormGroup

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.trailerURLFormControl = new FormControl(this.movie.trailer)
    this.trailerURLFormGroup = new FormGroup({
      trailerURL: this.trailerURLFormControl
    })
    this.movieFormControl = new FormControl('', Validators.required)
    this.movieFormGroup = new FormGroup({
      movie: this.movieFormControl
    })
  }

  backHome() {
    if (this.isUploading) {
      this.cancelUpload()
    }
    this.back.emit(true)
  }

  updateTrailerURL() {
    this.backend.updateMovie({ id: this.movieID, trailer: this.trailerURLFormGroup.value.trailerURL }).subscribe({
      next: (res) => {
        this.toast.showToast("Trailer Updated", true)
      },
      error: (err) => {
        this.toast.showToast("Unable to update trailer", false)
      }
    }
    )
  }

  // This method is called when the user selects a file
  onFileSelect(event: any) {
    const fileInput = event.target;
    this.file = fileInput.files[0];
    this.uploadProgress = 0; // Reset the progress when a new file is selected
  }

  // This method is called when the upload button is clicked
  upload() {
    if (!this.file) {
      this.toast.showToast("Select a file to upload", false)
      return;
    }

    this.uploadFile(this.file);
  }

  async uploadFile(file: File) {
    this.isUploading = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    try {
      // Step 1: Request backend to generate pre-signed URLs
      this.fileName = `${this.movieID}/${file.name}`
      const presignedUrlsData = await this.backend
        .generatePresignedUrls(this.fileName, file.type, file.size)
        .toPromise();  // Still using toPromise as per your request

      const { uploadId, presignedUrls } = presignedUrlsData;
      this.uploadId = uploadId
      const uploadedParts = [];
      const totalParts = presignedUrls.length;

      const chunkSize = 100 * 1024 * 1024;  // 100MB in bytes

      // Step 2: Upload parts to S3
      for (let i = 0; i < totalParts; i++) {
        if (signal.aborted) {
          throw new Error('Upload aborted');
        }
        const part = presignedUrls[i];
        const partNumber = part.partNumber;
        const url = part.presignedUrl;
        const startByte = (partNumber - 1) * chunkSize;
        const endByte = Math.min(startByte + chunkSize, file.size);
        const blob = file.slice(startByte, endByte);

        const uploadResponse = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: blob,
        });

        if (uploadResponse.ok) {
          const etag = uploadResponse.headers.get('etag');
          uploadedParts.push({ partNumber, etag });

          // Update progress after each part is uploaded
          this.uploadProgress = Math.floor(((i + 1) / totalParts) * 100);
        } else {
          throw new Error(`Failed to upload part ${partNumber} `);
        }
      }

      // Step 3: Complete the upload
      this.backend.completeUpload(uploadId, this.fileName, uploadedParts).subscribe({
        next: (res) => {
          this.toast.showToast("Movie Uploaded", true)
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          this.toast.showToast("Error while uploading", false)
        },
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      this.toast.showToast("Unable to Upload Movie", false)
    } finally {
      this.isUploading = false;
    }
  }

  cancelUpload() {
    if (this.isUploading && this.uploadId && this.file) {
      this.backend.abortUpload(this.uploadId, this.fileName).subscribe({
        next: (res) => { console.log(res), this.abortController?.abort(); this.toast.showToast("Upload aborted", true) },
        error: (err) => { console.log(err), this.toast.showToast("Failed to abort upload", false) }
      })
    }
  }

}
