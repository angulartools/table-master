import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TableDataValidator } from './table-data.validator.service';


@Injectable()
export class DefaultValidatorService implements TableDataValidator {

  getRowValidator(): UntypedFormGroup {
    return null;
  }
}
