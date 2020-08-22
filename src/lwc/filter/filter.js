import {LightningElement, api, wire} from 'lwc';
import getFamilyValues from '@salesforce/apex/PicklistController.getFamilyValues';
import getTypeValues from '@salesforce/apex/PicklistController.getTypeValues';

// Import message service features required for publishing and the message channel
import { publish,
        subscribe,
        unsubscribe,
        APPLICATION_SCOPE,
        MessageContext } from 'lightning/messageService';
import displayedProducts from '@salesforce/messageChannel/OrderManagementChannel__c';
import filteredProducts from '@salesforce/messageChannel/OrderManagementChannel__c';

export default class Filter extends LightningElement {

    subscription = null;

    typeSelect;

    familySelect;

    @wire(getFamilyValues)
    familyValues;

    @wire(getTypeValues)
    typeValues;

    productsToFilter;

    @wire(MessageContext)
    messageContext;

    // Encapsulate logic for Lightning message service subscribe and unsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                displayedProducts,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Handler for message received by component
    handleMessage(message) {
        this.productsToFilter = message;
    }

    // Standard lifecycle hooks used to subscribe and unsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    renderedCallback() {
        this.typeSelect = this.template.querySelectorAll('select')[0];
        this.familySelect = this.template.querySelectorAll('select')[1];
    }

    applyFilters() {
        let types = [];
        let families = [];
        for(let i = 0; i < this.typeSelect.selectedOptions.length; i++)
            types = this.typeSelect.selectedOptions[i].label;
        for(let i = 0; i < this.familySelect.selectedOptions.length; i++)
            families = this.familySelect.selectedOptions[i].label;

        if(this.productsToFilter) {
            let context = this;
            this.productsToFilter = this.productsToFilter.filter(function(product) {
                return context.filterHelper(types, product.Type__c) && context.filterHelper(families, product.Family__c);
            });
            publish(this.messageContext, filteredProducts, this.productsToFilter);
        }
    }

    filterHelper(filterByList, value) {
        if(filterByList.length > 0) {
            return filterByList.includes(value);
        }
        return true;
    }

}