import { LightningElement, wire } from 'lwc';
import getParentAccounts from '@salesforce/apex/AccountHelper.getParentAccounts';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import ACCOUNT_PARENT from '@salesforce/schema/Account.ParentId';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_SLA_EXPIRY from '@salesforce/schema/Account.SLAExpirationDate__c';
import ACCOUNT_SLA_TYPE from '@salesforce/schema/Account.SLA__c';
import ACCOUNT_NO_OF_LOCATIONS from '@salesforce/schema/Account.NumberofLocations__c';
import ACCOUNT_DESCRIPTION from '@salesforce/schema/Account.Description';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord } from 'lightning/uiRecordApi';

export default class AccountDetailsWithWire extends LightningElement {
    parentOptions=[]; // for Parent Account Options 
    selectedParentAccount = "";  
    selectedAccountName=''; 
    selectedSlaExpirationDate = null; 
    selNoOfLocations = "1"; 
    selectedSlaType =''; 
    selDescription = ''; 
    result;

    //https://developer.salesforce.com/docs/component-library/bundle/lightning-combobox/example 
    //combo accepts Object with label and value parameters { label: 'New', value: 'new' } 
    @wire(getParentAccounts)  
    wired_getParentAccounts({data, error}){ 
        this.parentOptions= []; 
        if(data){ 
            this.parentOptions = data.map((currItem) => ({ 
            label: currItem.Name, 
            value: currItem.Id 
            })); 
        }else if(error){ 
            console.log('Error while getting Parent Records',error); 
        } 
    } 

    @wire(getObjectInfo, { 
        objectApiName: ACCOUNT_OBJECT 
    }) 
    accountObjectInfo;

    @wire(getPicklistValues, { 
        recordTypeId: "$accountObjectInfo.data.defaultRecordTypeId", 
        fieldApiName: ACCOUNT_SLA_TYPE 
    }) 
    picklistResults({ error, data }) {
        if(data){
            console.log('data', data);
            this.result = data.values;
            console.log('result', this.result);
        }else if(error){
            console.log('error', error);
        }
    }
  

    handleChange(event){
        let {name, value} = event.target;
        if(name === 'parentAccount'){
            this.selectedParentAccount = value;
        }
        if(name === 'accountName'){
            this.selectedAccountName = value;
        }
        if(name === 'slaExpirationDate'){
            this.selectedSlaExpirationDate = value;
        }
        if(name === 'slaType'){
            this.selectedSlaType = value;
        }
        if(name === 'noOfLocations'){
            this.selNoOfLocations = value;
        }
        if(name === 'description'){
            this.selDescription = value;
        }
    }

    saveRecord(){
        console.log('ACCOUNT_OBJECT', ACCOUNT_OBJECT);
        if(this.validateInput()){
            let inputFields = {};
            inputFields[ACCOUNT_NAME.fieldApiName] = this.selectedAccountName;
            inputFields[ACCOUNT_PARENT.fieldApiName] = this.selectedParentAccount;
            inputFields[ACCOUNT_SLA_EXPIRY.fieldApiName] = this.selectedSlaExpirationDate;
            inputFields[ACCOUNT_NO_OF_LOCATIONS.fieldApiName] = this.selNoOfLocations;
            inputFields[ACCOUNT_DESCRIPTION.fieldApiName] = this.selDescription;
            inputFields[ACCOUNT_SLA_TYPE.fieldApiName] = this.selectedSlaType;
            
            let recordInput = {
                apiName : ACCOUNT_OBJECT.objectApiName,
                fields : inputFields

            };

            createRecord(recordInput)
            .then((result) => {
                console.log("Account Creates successfully");
            })
            .catch((error) => {
                console.log("Error in Creation", error);
            });
        }else{
            console.log("Inputs are not valid");
        }
    }

    validateInput(){
        let fields = Array.from(this.template.querySelectorAll(".validateme"));
        let isValid = fields.every(currItem => currItem.checkValidity());
        return isValid;
    }
}