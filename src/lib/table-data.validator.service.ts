import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Injectable()
export abstract class TableDataValidator {
  abstract getRowValidator(): UntypedFormGroup;
}
