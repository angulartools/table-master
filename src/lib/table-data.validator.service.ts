import { Service } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Service()
export abstract class TableDataValidator {
  abstract getRowValidator(): UntypedFormGroup;
}
