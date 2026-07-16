// @ts-nocheck
import { TableElement } from './table-element';
import { UntypedFormGroup } from '@angular/forms';

import { TableDataSource } from './table-data-source';

export class TableElementReactiveForms<T> extends TableElement<T> {
  id: number;
  originalData?: T;
  source: TableDataSource<T>;
  validator: UntypedFormGroup;

  override get currentData(): T {
    return this.validator.getRawValue();
  }

  override set currentData(data: T) {
    this.validator.patchValue(data);
  }

  override get editing(): boolean {
    return this.validator.enabled;
  }

  override set editing(value: boolean) {
    if (value) {
      this.validator.enable();
    } else {
      this.validator.disable();
    }
  }

  constructor(init: Partial<TableElementReactiveForms<T>>) {
    super();
    this.validator = init.validator;
    Object.assign(this, init);
  }

  isValid() {
    return this.validator.valid;
  }
}
