import { Service } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Service({ autoProvided: false })
export abstract class TableDataValidator {
  abstract getRowValidator(): UntypedFormGroup;
}
