import {LightningElement, wire, track} from 'lwc';
import getProductList from '@salesforce/apex/ProductController.getProductList';
import getProductDetail from '@salesforce/apex/ProductController.getProductDetail';

// Import message service features required for publishing and the message channel
import { publish,
        subscribe,
        unsubscribe,
        APPLICATION_SCOPE,
        MessageContext } from 'lightning/messageService';
import displayedProducts from '@salesforce/messageChannel/OrderManagementChannel__c';
import filteredProducts from '@salesforce/messageChannel/OrderManagementChannel__c';
import productToCart from '@salesforce/messageChannel/OrderManagementChannel__c';

const DELAY = 300;

export default class SearchProducts extends LightningElement {

    subscription = null;

    @track openDetailModal = false;

    @track productsToDisplay;

    @track productDetailedToDisplay;

    searchKey = '';

    @track prodId;

    @wire(MessageContext)
    messageContext;

    @wire(getProductList, { searchKey: '$searchKey' })
    products({data, error}) {
        if(data) {
            this.productsToDisplay = data;
            publish(this.messageContext, displayedProducts, data);
        }
    }

    @wire(getProductDetail, {prodId: '$prodId'})
    productDetailed({data, error}) {
        if(data) {
            this.productDetailedToDisplay = data;
            this.openDetailModal = true;
            console.log("Set true from wire");
        }
    }

    // Encapsulate logic for Lightning message service subscribe and unsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                filteredProducts,
                (message) => this.handleMessage(message),
                {scope: APPLICATION_SCOPE}
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Handler for message received by component
    handleMessage(message) {
        this.productsToDisplay = message;
    }


    // Standard lifecycle hooks used to subscribe and unsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }


    handleKeyUp(evt) {
        const key = evt.key || evt.keyCode;
        if(key === 'Enter' || key === 13) {
            window.clearTimeout(this.delayTimeout);
            let searchValue = evt.target.value;
            this.delayTimeout = setTimeout(() => {
                this.searchKey = searchValue;
            }, DELAY);
        }
    }

    handleDetailClick(evt) {
        if(this.prodId === evt.target.dataset.id) {
            this.openDetailModal = true;
            console.log("Set true from handler");
        }
        else
            this.prodId = evt.target.dataset.id;
    }

    handleCloseDetail(evt) {
        this.openDetailModal = false;
    }

    handleAddToCart(evt) {
        let product = {
            Id: evt.target.dataset.id,
            Name: evt.target.dataset.name,
            Price: evt.target.dataset.price,
            Quantity: 1
        };

        publish(this.messageContext, productToCart, product);

    }
}