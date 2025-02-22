import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment/moment';

import { WardSupplyDLService } from './wardsupply.dl.service';
import { WardRequisitionModel } from './ward-requisition.model';
import { WardStockModel } from './ward-stock.model';
import { WARDReportsModel } from './ward-report.model';
import { response } from '../../core/response.model';
import { Requisition } from '../../inventory/shared/requisition.model';


@Injectable()
export class WardSupplyBLService {
    WardSupplyDLService: any;

    constructor(public wardSplDLservice: WardSupplyDLService) {

    }
    // GET: Stock Details 
    public GetAllWardItemsStockDetailsList(storeId:number) {

    try {
      return this.wardSplDLservice.GetAllWardItemsStockDetailsList(storeId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // GET: Stock Details 
  public GetAvailableWardItemsStockDetailsList(storeId: number) {

    try {
      return this.wardSplDLservice.GetAvailableWardItemsStockDetailsList(storeId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  public GetInventoryStockDetailsList() {

        try {
            return this.wardSplDLservice.GetWardInventoryStockDetailsList()
                .map(res => { return res });
        }
        catch (ex) {
            throw ex;
        }
    }
  public GetInventoryStockByStoreId(StoreId:number) {

        try {
          return this.wardSplDLservice.GetInventoryStockByStoreId(StoreId)
                .map(res => { return res });
        }
        catch (ex) {
            throw ex;
        }
    }
    // get ward list.
    public GetActiveSubStoreList() {
      return this.wardSplDLservice.GetActiveSubStoreList()
            .map(res => { return res });
    }
    // get ward list.
  public GetWardList(currentStoreId: number) {
    return this.wardSplDLservice.WardList(currentStoreId)
            .map(res => { return res });
    }

    // Get Consumption Details list.
  public GetAllComsumptionListDetails(wardId, storeId) {
    return this.wardSplDLservice.GetAllComsumptionListDetails(wardId, storeId)
            .map(res => { return res });
    }
    //Get Inventory Consumption Details List
    public GetInventoryConsumptionListDetails(storeId,fromDate,toDate) {
        return this.wardSplDLservice.GetInventoryComsumptionListDetails(storeId,fromDate,toDate)
            .map(res => { return res });
    }

    // get ward resuistion list.
    public GetWardRequisitionList(status: string,storeId:number) {
        return this.wardSplDLservice.GetWardRequisitionList(status,storeId)
            .map(res => { return res });
    }

    //GET: To get ward Items List.
    public GetWardReqItemList(requisitionID) {
        return this.wardSplDLservice.GetWardReqItemList(requisitionID)
            .map(res => { return res });
    }
    public GetDepartments() {
        return this.wardSplDLservice.GetDepartments()
            .map((responseData) => {
                return responseData;
            });
    }
    //GET: To get Consumption Items List.
    public GetConsumptionItemList(patientId, wardId,storeId) {
        return this.wardSplDLservice.GetConsumptionItemList(patientId, wardId,storeId)
            .map(res => { return res });
    }
    //Get: To get Inventory Consumption Items List.
    public GetInventoryConsumptionItemList(userName,storeId) {
        return this.wardSplDLservice.GetInventoryConsumptionItemList(userName,storeId)
            .map(res => { return res });
    }

    //Get: To get Internal Consumption Items List.
    public GetInternalConsumptionList(storeId:number) {
        return this.wardSplDLservice.GetInternalConsumptionList(storeId)
            .map(res => { return res });
    }
    //Get: To get Internal Consumption Items List.
    public GetInternalConsumptionItemList(consumptionId) {
        return this.wardSplDLservice.GetInternalConsumptionItemList(consumptionId)
            .map(res => { return res });
    }

    //Get: To get Internal Consumption Details.
    public GetInternalConsumptionDetails(consumptionId) {
        return this.wardSplDLservice.GetInternalConsumptionDetails(consumptionId)
            .map(res => { return res });
    }
    //get phrm stock list
    GetItemTypeListWithItems() {
        return this.wardSplDLservice.GetItemTypeListWithItems()
            .map(res => { return res });
    }

    //get ward stock list
    GetWardStockList() {
        return this.wardSplDLservice.GetWardStockList()
            .map(res => { return res });
    }

    //GET: Patient List
    public GetPatients() {
        return this.wardSplDLservice.GetPatients()
            .map(res => { return res })
    }
    //GET: Dispatch Lists for item receive feature
    public GetDispatchListForItemReceive(RequisitionId) {
        return this.wardSplDLservice.GetDispatchListForItemReceive(RequisitionId)
            .map(res => { return res })
    }
    //Get: Ward Stock Report
    public GetStockItemsReport(itemId,storeId) {
        try {
            return this.wardSplDLservice.GetStockItemsReport(itemId,storeId)
                .map(res => { return res });
        }
        catch (ex) {
            throw ex;
        }
    }

    //Get: Ward Requisition Report
    public GetWardRequsitionReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetWardRequsitionReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //Get: Ward Breakage Report
    public GetWardBreakageReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetWardBreakageReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }


    //Get: Ward Consumpiton Report
    public GetWardConsumptionReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetWardConsumptionReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //Get:Ward Internal Consumption Report
    public GetWardInernalConsumptionReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetWardInernalConsumptionReport(wardReports)
            .map((responseData) => {
                return responseData
            });

    }


    


    //Get: Ward Transfer Report
    public GetWardTransferReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetWardTransferReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //Ward Inventory Reports
    //Get: Requisition and Dispatch Report
    public GetRequisitionDispatchReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetRequisitionDispatchReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //Get: Transfer Report
    public GetTransferReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetTransferReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //Get: Transfer Report
    public GetConsumptionReport(wardReports: WARDReportsModel) {
        return this.wardSplDLservice.GetConsumptionReport(wardReports)
            .map((responseData) => {
                return responseData;
            });
    }

    //POST
    PostConsumptionData(data) {
        let temp = data.map(a => {
            return _.omit(a, ['ConsumptionValidator', 'SelectedItem', 'selectedPatient']);
        });
        return this.wardSplDLservice.PostConsumptionData(temp)
            .map(res => { return res });
    }
    //POST  internal consumption data
    PostInternalConsumptionData(data) {
        let newConsumption = _.omit(data, ['InternalConsumptionValidator', 'SelectedItem']);
        let newConsumptionItems = newConsumption.WardInternalConsumptionItemsList;
        newConsumptionItems = newConsumptionItems.map(a => { return _.omit(a, ['InternalConsumptionItemsValidator','SelectedItem']) });
        newConsumption.WardInternalConsumptionItemsList = newConsumptionItems;
        return this.wardSplDLservice.PostInternalConsumptionData(newConsumption)
            .map(res => { return res });
    }
    //POST Inventory Consumption Data
    PostInventoryConsumptionData(data) {
        let temp = data.map(a => {
            return _.omit(a, ['ConsumptionValidator', 'SelectedItem', 'selectedPatient']);
        });
        return this.wardSplDLservice.PostInventoryConsumptionData(temp)
            .map(res => { return res });
    }

  //Post to Stock table and post to Transaction table 
  PostManagedStockDetails(selectedData,ReceivedBy:string) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostManagedStockDetails(data, ReceivedBy)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post Inventory stock from one department to another.
  PostInventoryStockTransfer(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostInventoryStockTransfer(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post ward supply stock back to inventory
  PostBackToInventory(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostBackToInventory(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and Transaction table for breakage items
  PostBreakageStockDetails(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostBreakageStockDetails(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }

    //Post Ward Requisition
    public PostWardRequisition(wardReq: WardRequisitionModel) {
        try {
            let newWardReq: any = _.omit(wardReq);
            let newWardReqItems = wardReq.WardRequisitionItemsList.map(item => {
                return _.omit(item, ['positiveNumberValdiator', 'WardRequestValidator', 'positiveNumberValdiatortest', 'WardRequestValidatortest']);
            });
            newWardReq.WardRequisitionItemsList = newWardReqItems;
            let data = JSON.stringify(newWardReq);
            return this.wardSplDLservice.PostWardRequisition(data)
                .map((res) => { return res });
        }

    catch (ex) {
      throw ex;
    }
  }
  //post ward stock to pharmacy
  public PostReturnStock(stockItems: Array<WardStockModel>, ReceivedBy: string) {

    let StockItems = stockItems.map(item => {
      return _.omit(item, ['StockManageValidator', 'positiveNumberValdiator'])
    })
    let data = JSON.stringify(StockItems);
    return this.wardSplDLservice.PostReturnStock(data, ReceivedBy)
      .map((res) => { return res });
  }
  //Put Consumption Item List
  public PutConsumptionData(data) {
    let temp = data.map(a => {
      return _.omit(a, ['ConsumptionValidator', 'SelectedItem', 'selectedPatient']);
    });
    return this.wardSplDLservice.PutConsumptionData(temp)
      .map(res => { return res });
  }
  // Put Internal Consumption Item List
  public PutInternalConsumptionData(data) {
    let temp = data.map(a => {
      return _.omit(a, ['InternalConsumptionValidator', 'SelectedItem']);
    });
    return this.wardSplDLservice.PutInternalConsumptionData(temp)
      .map(res => { return res })
  }
  public PutUpdateDispatchedItemsReceiveStatus(dispatchId,receivedRemarks) {
    let data = JSON.stringify(receivedRemarks);
    return this.wardSplDLservice.PutUpdateDispatchedItemsReceiveStatus(dispatchId,data)
      .map(res => { return res })
  }
  
  PutUpdateRequisition(requisition: Requisition) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newreq: any = _.omit(requisition, ['RequisitionValidator']);
    let newreqItems = requisition.RequisitionItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });

    newreq.RequisitionItems = newreqItems;

    let data = JSON.stringify(newreq);
    return this.wardSplDLservice.PutUpdateRequisition(data).map(res => { return res })
  }
}
