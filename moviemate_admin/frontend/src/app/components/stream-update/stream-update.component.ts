import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-stream-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stream-update.component.html',
  styleUrl: './stream-update.component.scss'
})
export class StreamUpdateComponent implements OnInit {

  @Input({ alias: 'movieID', required: true }) movieID!: string
  @Input({ alias: 'trailer', required: true }) trailer!: boolean
  @Input({ alias: 'movie', required: true }) movie!: boolean
  @Output('back') back = new EventEmitter<boolean>();
  file: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  trailerURLFormControl: FormControl = new FormControl('')
  movieFormControl: FormControl = new FormControl('', Validators.required)
  trailerURLFormGroup!: FormGroup
  movieFormGroup!: FormGroup

  constructor(private backend: BackendService) { }

  ngOnInit(): void {
    this.trailerURLFormGroup = new FormGroup({
      trailerURL: this.trailerURLFormControl
    })
    this.movieFormGroup = new FormGroup({
      movie: this.movieFormControl
    })
  }

  backHome() {
    this.back.emit(true)
  }

  updateTrailerURL() {
    console.log(this.trailerURLFormGroup.value)
    this.backend.updateMovie({ id: this.movieID, trailer: this.trailerURLFormGroup.value.trailerURL })
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
      alert('Please select a file to upload.');
      return;
    }

    this.uploadFile(this.file);
  }

  async uploadFile(file: File) {
    this.isUploading = true;
    try {
      // Step 1: Request backend to generate pre-signed URLs
      const presignedUrlsData = await this.backend
        .generatePresignedUrls(file.name, file.type, file.size)
        .toPromise();  // Still using toPromise as per your request

      const { uploadId, presignedUrls } = presignedUrlsData;
      const uploadedParts = [];
      const totalParts = presignedUrls.length;

      const chunkSize = 100 * 1024 * 1024;  // 5MB in bytes

      // Step 2: Upload parts to S3
      for (let i = 0; i < totalParts; i++) {
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
          throw new Error(`Failed to upload part ${partNumber}`);
        }
      }

      // Step 3: Complete the upload
      this.backend.completeUpload(uploadId, file.name, uploadedParts).subscribe({
        next: (res) => {
          alert('File uploaded successfully to S3!');
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          alert(err);
        },
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(err);
    } finally {
      this.isUploading = false;
    }
  }

}
