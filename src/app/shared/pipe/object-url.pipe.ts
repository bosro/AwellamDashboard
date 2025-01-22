import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'objectUrl',
  pure: false
})
export class ObjectUrlPipe implements PipeTransform, OnDestroy {
  private objectUrl: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  transform(file: File): SafeUrl {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.objectUrl = URL.createObjectURL(file);
    return this.sanitizer.bypassSecurityTrustUrl(this.objectUrl);
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}
