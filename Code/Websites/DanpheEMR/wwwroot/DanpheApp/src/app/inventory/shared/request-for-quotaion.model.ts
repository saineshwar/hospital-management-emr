import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

import { RequestForQuotationItemsModel } from "./request-for-quotation-item.model";
import { ItemMaster } from './item-master.model';
import { QuotationModel } from './quotation.model';
import { QuotationItemsModel } from './quotation-items.model';

export class RequestForQuotationModel {

  public ReqForQuotationId: number = 0;
  public QuotationId: number = 0;
  public ItemId: number = 0;
  public ItemName: string = null;
  public Subject: string = "";
  public Description: string = "";
  public RequestedBy: string = "";
  public CreatedOn: string = null;
  public ApprovedBy: number = 0;
  public RequestedOn: string = null;
  public RequestedCloseOn: string = null;
  public Status: string = null;
  public Item: ItemMaster = null;
  public SelectedItem: any = null;
  public ReqForQuotationItems: Array<RequestForQuotationItemsModel> = new Array<RequestForQuotationItemsModel>();

  public ReqForQuotation: Array<QuotationItemsModel> = new Array<QuotationItemsModel>();

  public ReqForQuotationValidator: FormGroup = null;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.ReqForQuotationValidator = _formBuilder.group({
      'Subject': ['', Validators.compose([Validators.required])],
      'Description': ['', Validators.compose([Validators.required])],
      'RequestedOn': ['', Validators.compose([Validators.required])],
      'RequestedCloseOn': ['', Validators.compose([Validators.required])],

    },
      {
        // Used custom form validator name
        validators: [this.RequestDateValidator("RequestedOn", "RequestedCloseOn")],
      });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ReqForQuotationValidator.dirty;
    else
      return this.ReqForQuotationValidator.controls[fieldName].dirty;
  }


  public IsValid(): boolean { if (this.ReqForQuotationValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ReqForQuotationValidator.valid;
    }
    else
      return !(this.ReqForQuotationValidator.hasError(validator, fieldName));
  }

  public RequestDateValidator(ReqDate: string, ReqClosedDate: string) {
    return (formGroup: FormGroup) => {
      const reqDate = formGroup.controls[ReqDate];
      const reqClosedDate = formGroup.controls[ReqClosedDate];

      if ((reqDate != null && reqDate != null)) {

        if (reqClosedDate.value < reqDate.value) {
          reqClosedDate.setErrors({ invalidReqDates: true });
        } else {
          reqClosedDate.setErrors(null);
        }
      }
    }
  }
}
