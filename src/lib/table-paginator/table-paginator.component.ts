import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '@angulartoolsdr/translation';

@Component({
  selector: 'lib-table-paginator',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss']
})
export class TablePaginatorComponent implements OnInit, OnChanges {
  @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  
  @Output() page = new EventEmitter<{ pageIndex: number; pageSize: number; length: number }>();

  currentPage: number = 1;

  ngOnInit() {
    this.updateVisiblePages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['length'] || changes['pageSize']) {
      const total = this.totalPages;
      if (this.currentPage > total) {
        this.currentPage = Math.max(1, total);
      }
      this.updateVisiblePages();
    }
  }

  get totalPages(): number {
    if (this.length === 0 || this.pageSize === 0) return 1;
    return Math.ceil(this.length / this.pageSize);
  }

  get rangeStart(): number {
    if (this.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.length ? this.length : end;
  }

  visiblePages: number[] = [];

  updateVisiblePages() {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;
    
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    this.visiblePages = pages;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisiblePages();
    this.page.emit({
      pageIndex: this.currentPage - 1,
      pageSize: this.pageSize,
      length: this.length
    });
  }

  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.updateVisiblePages();
    this.page.emit({
      pageIndex: 0,
      pageSize: this.pageSize,
      length: this.length
    });
  }
}
