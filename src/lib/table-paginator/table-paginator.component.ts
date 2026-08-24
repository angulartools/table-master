import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '@angulartoolsdr/translation';
import { Observable, Subscription } from 'rxjs';

interface PageableDataSource<T> {
  connect(): Observable<T[]>;
}

@Component({
  selector: 'lib-table-paginator',
  imports: [CommonModule, FormsModule, TranslationPipe],
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss']
})
export class TablePaginatorComponent<T> implements OnInit, OnChanges, OnDestroy {

  @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() items?: T[];
  @Input()
  set dataSource(value: PageableDataSource<T> | undefined) {
    this.dataSourceSubscription?.unsubscribe();
    this._dataSource = value;

    if (value) {
      this.dataSourceSubscription = value.connect().subscribe(items => {
        this.currentItems = items ?? [];
        this.refreshPagination();
      });
    }
  }

  @Output() page = new EventEmitter<{ pageIndex: number; pageSize: number; length: number }>();
  @Output() pagedItems = new EventEmitter<T[]>();

  currentPage: number = 1;
  private _dataSource?: PageableDataSource<T>;
  private dataSourceSubscription?: Subscription;
  private currentItems: T[] = [];

  ngOnInit() {
    this.refreshPagination();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && !this._dataSource) {
      this.currentItems = this.items ?? [];
    }

    if (changes['items'] || changes['length'] || changes['pageSize']) {
      this.refreshPagination();
    }
  }

  ngOnDestroy() {
    this.dataSourceSubscription?.unsubscribe();
  }

  get effectiveLength(): number {
    return this._dataSource || this.items !== undefined ? this.currentItems.length : this.length;
  }

  get totalPages(): number {
    if (this.effectiveLength === 0 || this.pageSize === 0) return 1;
    return Math.ceil(this.effectiveLength / this.pageSize);
  }

  get rangeStart(): number {
    if (this.effectiveLength === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.effectiveLength ? this.effectiveLength : end;
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

  private refreshPagination() {
    const total = this.totalPages;
    if (this.currentPage > total) {
      this.currentPage = Math.max(1, total);
    }
    this.updateVisiblePages();
    this.emitPagedItems();
  }

  private emitPagedItems() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedItems.emit(this.currentItems.slice(start, start + this.pageSize));
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateVisiblePages();
    this.emitPagedItems();
    this.page.emit({
      pageIndex: this.currentPage - 1,
      pageSize: this.pageSize,
      length: this.effectiveLength
    });
  }

  onPageSizeChange(size: any) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.updateVisiblePages();
    this.emitPagedItems();
    this.page.emit({
      pageIndex: 0,
      pageSize: this.pageSize,
      length: this.effectiveLength
    });
  }
}
