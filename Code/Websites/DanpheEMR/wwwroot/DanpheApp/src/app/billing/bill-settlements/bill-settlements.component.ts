import { Component, OnChanges, SimpleChanges, DoCheck, Input, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'
import * as moment from 'moment/moment';

import { PatientService } from '../../patients/shared/patient.service';
import { Patient } from '../../patients/shared/patient.model';

import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';

import { BillingTransaction } from '../shared/billing-transaction.model';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
//to add danphe-grid in credit-details page:sudarshan 26Mar'17
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { RouteFromService } from '../../shared/routefrom.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { BillingReceiptModel } from "../shared/billing-receipt.model";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { CommonFunctions } from "../../shared/common.functions";
import { BillSettlementModel } from "../shared/bill-settlement.model";

@Component({
  selector: 'my-app',
  templateUrl: "./bill-settlements.html"
})

// App Component class
export class BillSettlementsComponent {

  public allPendingSettlements: Array<any> = [];//this contains settleme
  public patCrInvoicDetails: Array<BillingTransaction> = [];

  public SettlementGridCols: Array<any> = null;

  public selectAllInvoices: boolean = false;
  public showActionPanel: boolean = false;

  public selInvoicesTotAmount: number = 0;

  public model: BillSettlementModel = new BillSettlementModel();
  public setlmntToDisplay = new BillSettlementModel();

  public showReceipt: boolean = false;//to show hide settlement grid+action panel   OR  SettlementReceipt
  public showGrid: boolean = true;

  //sud: 13May'18--to display patient bill summary
  public patBillHistory = {
    IsLoaded: false,
    PatientId: null,
    CreditAmount: null,
    ProvisionalAmt: null,
    TotalDue: null,
    DepositBalance: null,
    BalanceAmount: null
  };

  public loading: boolean = false;

  constructor(public billingService: BillingService,
    public router: Router,
    public routeFromService: RouteFromService,
    public billingBLService: BillingBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public callbackservice: CallbackService,
    public patientService: PatientService,
    public msgBoxServ: MessageboxService) {

    let counterId: number = this.securityService.getLoggedInCounter().CounterId;
    if (!counterId || counterId < 1) {
      this.callbackservice.CallbackRoute = '/Billing/Settlements/BillSettlements';
      this.router.navigate(['/Billing/CounterActivate']);
    }
    else {
      this.SettlementGridCols = GridColumnSettings.BillSettlementBillSearch;
      this.GetBillsForSettlement();
      this.showGrid = true;
    }


  }

  GetBillsForSettlement() {
    this.allPendingSettlements = [];
    this.billingBLService.GetPendingBillsForSettlement()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allPendingSettlements = res.Results;
        }
      });
  }


  SettlementGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showDetails":
        {
          var data = $event.Data;
          this.GetPatientCreditInvoices(data);
          //this.LoadPatientPastBillSummary(data.PatientId);
        }
        break;
      default:
        break;
    }
  }

  GetPatientCreditInvoices(row): void {
    this.loading = true;
    this.showGrid = false;
    this.showActionPanel = true;
    this.showReceipt = false;
    //patient mapping later used in receipt print
    let patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.ShortName;
    patient.PatientCode = row.PatientCode;
    patient.DateOfBirth = row.DateOfBirth;
    patient.Gender = row.Gender;
    patient.PatientId = row.PatientId;
    patient.PhoneNumber = row.PhoneNumber;

    this.billingBLService.GetCreditInvoicesByPatient(patient.PatientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.patCrInvoicDetails = res.Results.CreditItems;
          this.patientService.globalPatient = res.Results.Patient;
          this.patCrInvoicDetails.forEach(function (inv) {
            inv.Patient = res.Results.Patient;
            inv.CreatedOn = moment(inv.CreatedOn).format("YYYY-MM-DD HH:mm");
            //adding new field to manage checked/unchecked invoice.
            inv.IsSelected = false;
          });

          //by default selecting all items.
          this.selectAllInvoices = true;
          this.SelectAllChkOnChange();
          this.LoadPatientPastBillSummary(this.patientService.globalPatient.PatientId, res.Results.IsPatientAdmitted);
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("error", ["Couldn't fetch patient's credit details. Please try again later"], res.ErrorMessage);

        }
      });
  }

  public settelmentProceedEnable: boolean = true;

  //sud: 13May'18--to display patient's bill history
  LoadPatientPastBillSummary(patientId: number, IsPatientAdmitted: boolean) {
    this.billingBLService.GetPatientPastBillSummary(patientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.patBillHistory = res.Results;
          this.patBillHistory.CreditAmount = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount);
          //provisional amount should exclude itmes those are listed for payment in current window.
          this.patBillHistory.ProvisionalAmt = CommonFunctions.parseAmount(this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.TotalDue = CommonFunctions.parseAmount(this.patBillHistory.CreditAmount + this.patBillHistory.ProvisionalAmt);
          this.patBillHistory.BalanceAmount = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance - this.patBillHistory.TotalDue);
          //if balance is negative it'll be payableamt otherwise it'll be refundable amount.
          this.patBillHistory.BalanceAmount < 0 ? (this.model.PayableAmount = (-this.patBillHistory.BalanceAmount)) : (this.model.RefundableAmount = this.patBillHistory.BalanceAmount)
          this.patBillHistory.DepositBalance = CommonFunctions.parseAmount(this.patBillHistory.DepositBalance);
          this.patBillHistory.IsLoaded = true;

          //this.model.DueAmount = this.patBillHistory.BalanceAmount;
          this.model.PayableAmount = this.patBillHistory.CreditAmount;
          this.model.PaidAmount = this.model.PayableAmount;
          this.model.ReturnedAmount = this.model.RefundableAmount;

          if (this.patBillHistory.CreditAmount > 0 && IsPatientAdmitted) {
            this.settelmentProceedEnable = true;
          }
          else if (this.patBillHistory.ProvisionalAmt > 0) {
            this.msgBoxServ.showMessage("warning", ["There are few items in provisional list, please generate their invoices and proceed for settlement"], null, false);
            this.settelmentProceedEnable = false;
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }


  BackToGrid() {
    this.showGrid = true;
    this.showActionPanel = false;
    this.showReceipt = false;
    this.setlmntToDisplay = new BillSettlementModel()
    //reset current patient value on back button.. 
    this.patientService.CreateNewGlobal();
    this.patCrInvoicDetails = [];
    this.model = new BillSettlementModel();
    this.GetBillsForSettlement();
  }


  SelectAllChkOnChange() {
    if (this.patCrInvoicDetails && this.patCrInvoicDetails.length) {
      if (this.selectAllInvoices) {
        this.patCrInvoicDetails.forEach(itm => {
          itm.IsSelected = true;
        });
        this.showActionPanel = true;
      }
      else {
        this.patCrInvoicDetails.forEach(itm => {
          itm.IsSelected = false;
        });
        this.showActionPanel = false;

      }

      this.CalculateTotalAmt();
    }
  }

  //Sets the component's check-unchecked properties on click of Component-Level Checkbox.
  SelectItemChkOnChange(item: BillingTransactionItem) {

    //show action panel if any one of item is checked.
    if (this.patCrInvoicDetails.find(itm => itm.IsSelected)) {
      this.showActionPanel = true;
    }
    else {
      this.showActionPanel = false;
    }

    if ((this.patCrInvoicDetails.every(a => a.IsSelected == true))) {
      this.selectAllInvoices = true;
    }
    else {
      this.selectAllInvoices = false;
    }

    this.CalculateTotalAmt();
  }

  CalculateTotalAmt() {
    this.selInvoicesTotAmount = 0;
    this.patCrInvoicDetails.forEach(inv => {
      if (inv.IsSelected) {
        this.selInvoicesTotAmount += inv.TotalAmount;
      }
    });
    this.selInvoicesTotAmount = CommonFunctions.parseAmount(this.selInvoicesTotAmount);
  }

  PayProvisionalItems() {
    let patId = this.patientService.globalPatient.PatientId;

    this.billingBLService.GetProvisionalItemsByPatientId(patId)
      .subscribe(res => {
        let provItems = res.Results.CreditItems;

        //changed: 4May-anish
        let billingTransaction = this.billingService.CreateNewGlobalBillingTransaction();
        billingTransaction.PatientId = patId;

        provItems.forEach(bil => {
          let curBilTxnItm = BillingTransactionItem.GetClone(bil);
          billingTransaction.BillingTransactionItems.push(curBilTxnItm);

        });
        this.router.navigate(['/Billing/BillingTransactionItem']);

      });
  }
  SettlePatientBills() {
    this.loading = true;
    if (this.CheckIsDiscountApplied()) {
      this.model.BillingTransactions = this.patCrInvoicDetails;

      let setlmntToPost = this.GetSettlementInvoiceFormatted();

      this.billingBLService.PostSettlementInvoice(setlmntToPost)
        .subscribe((res: DanpheHTTPResponse) => {
          console.log("Response from server:");
          console.log(res);

          this.setlmntToDisplay = res.Results;
          this.setlmntToDisplay.BillingUser = this.securityService.GetLoggedInUser().UserName;
          this.setlmntToDisplay.Patient = this.patientService.globalPatient;
          this.showReceipt = true;
          this.showActionPanel = false;
          this.loading = false;

        },
          err => {
            this.msgBoxServ.showMessage("failed", [err.ErrorMessage]);
          }

        );
    }
    else {
      this.loading = false;
    }
  }

  CheckIsDiscountApplied(): boolean {
    if (this.model.IsDiscounted && !this.model.Remarks) {
      this.msgBoxServ.showMessage('failed', ["Remarks is mandatory in case of discount."]);
      return false;
    }
    else
      return true;
  }

  GetSettlementInvoiceFormatted(): BillSettlementModel {
    let retSettlModel = new BillSettlementModel();
    retSettlModel.BillingTransactions = this.patCrInvoicDetails;
    retSettlModel.PatientId = this.patientService.globalPatient.PatientId;
    retSettlModel.PayableAmount = this.model.PayableAmount;
    retSettlModel.RefundableAmount = this.model.RefundableAmount;
    retSettlModel.PaidAmount = this.model.PaidAmount;
    retSettlModel.ReturnedAmount = this.model.ReturnedAmount;
    retSettlModel.DepositDeducted = this.patBillHistory.DepositBalance;
    retSettlModel.DueAmount = this.model.DueAmount > 0 ? this.model.DueAmount : (-this.model.DueAmount);
    retSettlModel.PaymentMode = this.model.PaymentMode;
    retSettlModel.PaymentDetails = this.model.PaymentDetails;
    retSettlModel.CounterId = this.securityService.getLoggedInCounter().CounterId;
    retSettlModel.DiscountAmount = this.model.DiscountAmount;
    retSettlModel.Remarks = this.model.Remarks;
    return retSettlModel;
  }

  OnPaymentModeChange() {

  }
  PaidAmountOnChange() {
    if (this.model.PayableAmount < this.model.PaidAmount) {
      this.model.ReturnedAmount = CommonFunctions.parseAmount(this.model.PaidAmount - this.model.PayableAmount);
      this.model.IsDiscounted = false;
      this.model.DiscountAmount = 0;
    }

    else if (this.model.PayableAmount > this.model.PaidAmount) {
      this.model.DiscountAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
      this.model.IsDiscounted = true;
      this.model.ReturnedAmount = 0;
    }
  }
  DiscountAmountOnChange() {
    this.model.PaidAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.DiscountAmount);
  }
  DiscountChkOnChange() {
    if (this.model.IsDiscounted) {
      this.model.DiscountAmount = this.model.DueAmount;
      this.model.DueAmount = 0;
    }
    else {
      this.model.DiscountAmount = 0;
      this.model.DueAmount = CommonFunctions.parseAmount(this.model.PayableAmount - this.model.PaidAmount);
    }
  }

  //this is called after event emmitted from settlement receipt
  OnReceiptClosed($event) {
    //write logic based on $event later on.. for now only close this..
    this.showReceipt = false;
    this.setlmntToDisplay = new BillSettlementModel();
    this.GetBillsForSettlement();
    this.BackToGrid();
    this.changeDetector.detectChanges();

  }
}


