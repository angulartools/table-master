import { ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal, numberAttribute, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationPipe } from '@angulartoolsdr/translation';
import { Observable } from 'rxjs';

interface PageableDataSource<T> {
  connect(): Observable<T[]>;
}

@Component({
  selector: 'lib-table-paginator',
  imports: [FormsModule, TranslationPipe],
  templateUrl: './table-paginator.component.html',
  styleUrl: './table-paginator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablePaginatorComponent<T> {
  readonly length = input(0, { transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });
  readonly pageSizeOptions = input([5, 10, 20]);
  readonly items = input<T[] | undefined>();
  readonly dataSource = input<PageableDataSource<T> | undefined>();

  readonly page = output<{ pageIndex: number; pageSize: number; length: number }>();
  readonly pagedItems = output<T[]>();

  readonly currentPage = signal(1);
  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  });

  readonly effectivePageSize = linkedSignal(() => this.pageSize());
  private readonly currentItems = signal<T[]>([]);

  readonly effectiveLength = computed(() =>
    this.dataSource() || this.items() !== undefined
      ? this.currentItems().length
      : this.length()
  );
  readonly totalPages = computed(() => {
    const size = this.effectivePageSize();
    const length = this.effectiveLength();
    return length === 0 || size === 0 ? 1 : Math.ceil(length / size);
  });
  readonly rangeStart = computed(() =>
    this.effectiveLength() === 0 ? 0 : (this.currentPage() - 1) * this.effectivePageSize() + 1
  );
  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.effectivePageSize(), this.effectiveLength())
  );

  constructor() {
    effect(() => {
      if (!this.dataSource()) {
        this.currentItems.set(this.items() ?? []);
      }
    });

    effect(onCleanup => {
      const dataSource = this.dataSource();
      if (!dataSource) {
        return;
      }

      const subscription = dataSource.connect().subscribe(items => {
        this.currentItems.set(items ?? []);
      });
      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      const total = this.totalPages();
      const page = this.currentPage();
      if (page > total) {
        this.currentPage.set(Math.max(1, total));
      }
    });

    effect(() => {
      const items = this.currentItems();
      const start = (this.currentPage() - 1) * this.effectivePageSize();
      this.pagedItems.emit(items.slice(start, start + this.effectivePageSize()));
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.currentPage.set(page);
    this.page.emit({
      pageIndex: page - 1,
      pageSize: this.effectivePageSize(),
      length: this.effectiveLength()
    });
  }

  onPageSizeChange(size: number | string) {
    const pageSize = Number(size);
    this.effectivePageSize.set(pageSize);
    this.currentPage.set(1);
    this.page.emit({
      pageIndex: 0,
      pageSize,
      length: this.effectiveLength()
    });
  }
}
