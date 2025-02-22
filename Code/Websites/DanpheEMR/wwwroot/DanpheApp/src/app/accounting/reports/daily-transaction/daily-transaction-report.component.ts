import { Component, ChangeDetectorRef } from '@angular/core';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { AccountingReportsBLService } from "../shared/accounting-reports.bl.service";
import { CommonFunctions } from '../../../shared/common.functions';
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service";
import { CoreService } from '../../../core/shared/core.service';

@Component({
  selector: 'my-app',
  templateUrl: "./daily-transaction-report.html"
})
export class DailyTransactionReportComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public showReportData: boolean = false;
  public dailyTxnGridColumns: Array<any> = null;
  public dailyTxnList: Array<any> = null;
  public showDetailsPopUp: boolean = false;
  public txnOriginData: Array<any> = null;
  public txnDepositData: Array<any> = null;
  public selectedTxn: any;
  dlService: DLService = null;
  public isDeposit: boolean = false;
  public isBilling: boolean = false;
  public showExportbtn : boolean=false;
  public fiscalyearList: any;
  public calType: string = "";   
  public showPrint: boolean = false;
  public printDetaiils: any;
  public selectedDate: string = "";
  public fiscalYearId:number=null; 
  constructor(
    _dlService: DLService,
    public msgBoxServ: MessageboxService,
    public accReportBLService: AccountingReportsBLService,
    public coreservice : CoreService,
    public changeDetector: ChangeDetectorRef) {
    this.dailyTxnGridColumns = GridColumnSettings.AccDailyTxnReport;
    this.GetFiscalYearList();
    this.showExport();
    //this.LoadCalendarTypes();     
    this.calType = this.coreservice.DatePreference;
  }


  //loads CalendarTypes from Paramter Table (database) and assign the require CalendarTypes to local variable.
  LoadCalendarTypes() {
   let Parameter = this.coreservice.Parameters;
   Parameter = Parameter.filter(parms => parms.ParameterName == "CalendarTypes");
   let calendarTypeObject = JSON.parse(Parameter[0].ParameterValue);
   this.calType = calendarTypeObject.AccountingModule;
   }
   
  gridExportOptions = {
    fileName: 'DailyTransactionReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  public GetFiscalYearList() {
    this.accReportBLService.GetFiscalYearsList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.fiscalyearList = res.Results;
          //this.currentFiscalYear = this.fiscalyearList.find(x => x.IsActive == true);
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }

      });
  } 
  public validDate:boolean=true;
  selectDate(event){
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
    } 
    else {
      this.validDate =false;
    } 
  }
  loadData() {
    if (this.checkDateValidation()) {        
      this.accReportBLService.GetDailyTxnReport(this.fromDate, this.toDate,this.fiscalYearId)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length) {
            this.formattingData(res.Results);
            //this.dailyTxnList = res.Results;
            this.showReportData = true;
          }
          else {
            this.msgBoxServ.showMessage("notice", ["no record found."]);
          }
        });
      
    }
  }

  checkDateValidation() {
    if(!this.validDate){
      this.msgBoxServ.showMessage("error", ['select proper date']);
      return false;
    }
    var frmdate = moment(this.fromDate, "YYYY-MM-DD");
    var tdate = moment(this.toDate, "YYYY-MM-DD");
    var flg = false;
    this.fiscalyearList.forEach(a => {
      if ((moment(a.StartDate, 'YYYY-MM-DD') <= frmdate) && (tdate <= moment(a.EndDate, 'YYYY-MM-DD'))) {
        flg = true;
      }
    });
    if (flg == false) {
      this.msgBoxServ.showMessage("error", ['Selected dates must be within a fiscal year']);
      return flg;
    }
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }

  formattingData(data) {
    this.dailyTxnList = [];
    data.forEach(a => {
      let Obj = new Object();
      let check = true;
      Obj["VoucherNumber"] = a.VoucherNumber;
      Obj["TransactionDate"] = a.TransactionDate;
      Obj["TransactionId"] = a.TransactionId;
      Obj["TransactionType"] = a.TransactionType;
      Obj["SectionId"] = a.SectionId;     
      let str = a.VoucherNumber ? a.VoucherNumber.slice(0, 3) : "";
      Obj["showOptions"] = str == "ACC" ? false : true;   //manual entry will have ACC as voucherNo.. so no details are present to show
      a.txnItems.forEach(b => {
        if (!check) {
          Obj = new Object();
        }
        Obj["LedgerName"] = b.LedgerName;
        Obj["DrAmount"] = b.DrAmount;
        Obj["CrAmount"] = b.CrAmount;
        Obj["Code"] = b.Code;
        //if (b.DrCr)
        //    Obj["DrAmount"] = b.Amount;
        //else if (!b.DrCr)
        //    Obj["CrAmount"] = b.Amount;


        this.dailyTxnList.push(Obj);
        check = false;
      });
    });
  }

  gridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "viewDetails": {
        this.changeDetector.detectChanges();
        this.getTxnOriginsDetails($event.Data);
        // this.showDetailsPopUp = true;
      }
      default:
        break;
    }
  }

  getTxnOriginsDetails(data) {
    this.selectedTxn = data;
    if (this.selectedTxn.SectionId == 3) {
      if (typeof this.selectedTxn.TransactionType === 'string') {
        this.selectedTxn.TransactionType = this.selectedTxn.TransactionType;
      }
      else {
        this.selectedTxn.TransactionType = this.selectedTxn.TransactionType[0];
      }
    }
    //if (this.selectedTxn.TransactionType[0] == "DepositAdd" || this.selectedTxn.TransactionType[0] == "DepositReturn") {
    //    this.isDeposit = true;
    //}
    //else {
    //    this.isDeposit = false;
    //}
    this.accReportBLService.GetTxnOriginDetails(data.TransactionId.toString()).subscribe(res => {
      if (res.Status == "OK") {
        //this.txnOriginData = res.Results;
        let data = res.Results;
        let taxTotal = 0;
        let salesTotal = 0;
        let discountAmount = 0;
        let amountTotal = 0;
        let subTotal = 0;
        let depositTotal = 0;

        if (this.selectedTxn.SectionId == 1) {
          this.txnOriginData = data;
          this.txnOriginData.forEach(a => {
            if (a.TransactionType.includes("GoodReceipt")) {
              taxTotal += a.itm.VAT;
              discountAmount += a.itm.DiscountAmount;
              salesTotal = salesTotal + (a.itm.TotalAmount - a.itm.Tax);
              amountTotal += a.itm.TotalAmount;
              subTotal += a.itm.SubTotal;
            }
            if (a.TransactionType.includes("WriteOff")) {
              amountTotal += a.itm.TotalAmount;
            }
            if (a.TransactionType.includes("ReturnToVendor")) {
              taxTotal += a.itm.VAT;
              amountTotal += a.itm.TotalAmount;
            }
            if (a.TransactionType.includes("DispatchToDept")) {
              amountTotal += a.itm.TotalAmount;
              taxTotal += a.itm.VAT;
              discountAmount += a.itm.DiscountAmount;
            }
            if (a.TransactionType.includes("INVDeptConsumedGoods")) {
              amountTotal += a.itm.TotalAmount;
              taxTotal += a.itm.VAT;
              discountAmount += a.itm.DiscountAmount;
            }
            if (a.TransactionType.includes("INVStockManageOut")) {
              amountTotal += a.itm.TotalAmount;
              taxTotal += a.itm.VAT;
              discountAmount += a.itm.DiscountAmount;
            }
          });
        }
        else if (this.selectedTxn.SectionId == 2) {
            this.txnOriginData = data.BillData;
            //this.txnOriginData.forEach(a => {
            //    if (a.TransactionType == "DepositAdd" || a.TransactionType == "DepositReturn") {
            //        //    subTotal += a.itm.SubTotal;
            //        // amountTotal += a.itm.TotalAmount;
            //        amountTotal += a.TotalAmount;
            //    }
            //    else {
            //        taxTotal += a.itm.Tax;
            //        discountAmount += a.itm.DiscountAmount;
            //        salesTotal = salesTotal + (a.itm.TotalAmount - a.itm.Tax);
            //        amountTotal += a.itm.TotalAmount;
            //    }
            //});
            if (this.txnOriginData.length) {
              this.isBilling = true;
              this.txnOriginData.forEach(a => {
                taxTotal += a.itm.Tax;
                discountAmount += a.itm.DiscountAmount;
                salesTotal = salesTotal + (a.itm.TotalAmount - a.itm.Tax);
                amountTotal += a.itm.TotalAmount;
              });
            }
            else {
              this.isBilling = false;
            }
            this.txnDepositData = data.DepositData;
            if (this.txnDepositData.length) {
              this.isDeposit = true;
              this.txnDepositData.forEach(a => {
                depositTotal += a.TotalAmount;
              });
            }
            else {
              this.isDeposit = false;
            }
        }
        else if (this.selectedTxn.SectionId == 5){
          this.txnOriginData = data;       
        }
        else {
            this.txnOriginData = data;
            this.txnOriginData.forEach(a => {
              taxTotal += a.VATAmount;
              discountAmount += a.DiscountAmount;
              amountTotal += a.TotalAmount;
            });
        }

        this.selectedTxn["discountAmount"] = CommonFunctions.parseAmount(discountAmount);
        this.selectedTxn["taxTotal"] = CommonFunctions.parseAmount(taxTotal);
        this.selectedTxn["salesTotal"] = CommonFunctions.parseAmount(salesTotal);
        this.selectedTxn["amountTotal"] = CommonFunctions.parseAmount(amountTotal);
        this.selectedTxn["subTotal"] = CommonFunctions.parseAmount(subTotal);
        this.selectedTxn["depositTotal"] = CommonFunctions.parseAmount(depositTotal);

        this.showDetailsPopUp = true;
      }
      else {
        this.msgBoxServ.showMessage("notice", ["no record found."]);
      }
    });
  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the excel export....
  OnGridExport($event: GridEmitModel) {
    let workSheetName = 'Daily Transaction Report';
    let Heading = 'Daily Transaction Report';
    let filename = 'Daily Transaction Report';
    CommonFunctions.ConvertHTMLTableToExcel('gridExportToExcel', this.fromDate, this.toDate, workSheetName, Heading, filename);
  }
  // Export to excel transaction details
  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = 'Transaction Detail Report';
      let Heading = 'Transaction Detail Report';
      let filename = 'TransactionDetailReport';

      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.fromDate, this.toDate, workSheetName,
        Heading, filename);
    }
  }
  Print() {
    let popupWinindow;
    var headerContent = document.getElementById("headerForPrint").innerHTML;
    var printContents = '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';
    printContents += document.getElementById("printpage").innerHTML;    
    this.showPrint = false;
    this.printDetaiils = null;
    this.changeDetector.detectChanges();
    this.showPrint = true;
    this.printDetaiils = headerContent + printContents ; 

  }
  Close() {
    this.txnOriginData = null;
    this.showDetailsPopUp = false;
    this.selectedTxn = null;
  }
  showExport(){

    let exportshow = this.coreservice.Parameters.find(a => a.ParameterName =="AllowSingleVoucherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
        if ( exportshow== "true"){
          this.showExportbtn =true;     
        }
        else{
            this.showExportbtn = false;
        }
      }
}
