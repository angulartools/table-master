import { Service } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TableDataValidator } from './table-data.validator.service';


@Service({ autoProvided: false })
export class DefaultValidatorService implements TableDataValidator {

  getRowValidator(): UntypedFormGroup {
    return null;
  }
}
