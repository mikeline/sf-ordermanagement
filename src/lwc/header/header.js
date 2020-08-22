import { LightningElement, wire, track} from 'lwc';
import getAccountInfo from '@salesforce/apex/AccountController.getAccountInfo';
import createOrder from '@salesforce/apex/OrderController.createOrder';
import getUserDetails from '@salesforce/apex/UserInfoController.getUserDetails';
import Id from '@salesforce/user/Id';
import getFamilyValues from '@salesforce/apex/PicklistController.getFamilyValues';
import getTypeValues from '@salesforce/apex/PicklistController.getTypeValues';
import createNewProduct from '@salesforce/apex/ProductController.createNewProduct';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';


// Import message service features required for publishing and the message channel
import { publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext } from 'lightning/messageService';
import productToCart from '@salesforce/messageChannel/OrderManagementChannel__c';
import enableButtons from '@salesforce/messageChannel/OrderManagementChannel__c';

export default class Header extends LightningElement {

    userId = Id;

    subscription = null;

    openCartModal = false;

    openCreateProductModal = false;

    isManager = false;

    user;

    @track productsInCart = [];

    accountToDisplay;

    newProduct = {
        Name: '',
        Description: '',
        Type: '',
        Family: '',
        Image: '',
        Price: 0
    };

    key = new URL(window.location.href).searchParams.get("c__id");

    @wire(getAccountInfo, {key: '$key'})
    account({data, error}) {
        if(data) {
            this.accountToDisplay = data;
        }
    }

    @wire(getUserDetails, {
        recId: '$userId'
    })
    wiredUser({data, error}) {
        if (data) {
            this.user = data;
            console.log("Is manager: " + this.user.IsManager__c)
            if(this.user.IsManager__c) {
                this.isManager = true;
            }
        }
    }

    typeValues = [];

    selectedTypeValue;

    @wire(getTypeValues)
    types({data, error}) {
        if(data) {
            for(let i = 0; i < data.length; i++) {
                this.typeValues = [...this.typeValues ,{label: data[i].Value, value: data[i].Value} ]
            }
            this.selectedTypeValue = this.typeValues[0].Value;
        }
    }

    familyValues = [];

    selectedFamilyValue;

    @wire(getFamilyValues)
    families({data, error}) {
        if(data) {
            for(let i = 0; i < data.length; i++) {
                this.familyValues = [...this.familyValues ,{label: data[i].Value, value: data[i].Value} ]
            }
            this.selectedFamilyValue = this.familyValues[0].Value;
        }
    }

    @wire(MessageContext)
    messageContext;


    get optionsType() {
        return this.typeValues;
    }

    get optionsFamily() {
        return this.familyValues;
    }

    // Encapsulate logic for Lightning message service subscribe and unsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                productToCart,
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
        if(message.Id !== '' || message.Id !== null)
            for(let i = 0; i < this.productsInCart.length; i++) {
                if(this.productsInCart[i].Id === message.Id) {
                    this.productsInCart[i] = {
                        Id: this.productsInCart[i].Id,
                        Name: this.productsInCart[i].Name,
                        Price: this.productsInCart[i].Price,
                        Quantity: this.productsInCart[i].Quantity + 1
                    };
                    return;
                }
            }
            this.productsInCart.push(message);
    }

    // Standard lifecycle hooks used to subscribe and unsubscribe to the message channel
    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    handleCartClick(evt) {
        this.openCartModal = true;
    }

    handleCartClose(evt) {
        this.openCartModal = false;
    }

    incQuantity(evt) {
        let prodId = evt.target.dataset.id;
        for(let i = 0; i < this.productsInCart.length; i++) {
            if(this.productsInCart[i].Id === prodId) {
                this.productsInCart[i] = {
                    Id: this.productsInCart[i].Id,
                    Name: this.productsInCart[i].Name,
                    Price: this.productsInCart[i].Price,
                    Quantity: this.productsInCart[i].Quantity + 1
                };
            }
        }
    }

    decQuantity(evt) {
        let prodId = evt.target.dataset.id;
        for(let i = 0; i < this.productsInCart.length; i++) {
            if(this.productsInCart[i].Id === prodId) {
                if(this.productsInCart[i].Quantity > 1) {
                    this.productsInCart[i] = {
                        Id: this.productsInCart[i].Id,
                        Name: this.productsInCart[i].Name,
                        Price: this.productsInCart[i].Price,
                        Quantity: this.productsInCart[i].Quantity - 1
                    };
                }
            }
        }
    }

    handleCheckout(evt) {
        createOrder({accId: this.accountToDisplay.Id, items: this.productsInCart.slice(1)})
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Order has been created',
                        variant: 'success',
                    }),
                );
                this.productsInCart = [];
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleCreateProductClick(evt) {
        this.openCreateProductModal = true;
    }

    handleCreateProductClose(evt) {
        this.openCreateProductModal = false;
    }

    handleNameChange(evt) {
        this.newProduct.Name = evt.target.value;
    }

    handleDescChange(evt) {
        this.newProduct.Description = evt.target.value;
    }

    handleImageChange(evt) {
        this.newProduct.Image = evt.target.value;
    }

    handlePriceChange(evt) {
        this.newProduct.Price = evt.target.value;
    }

    handleChangeType(evt) {
        this.selectedTypeValue = evt.detail.value;
        this.newProduct.Type = evt.target.value;
    }

    handleChangeFamily(evt) {
        this.selectedFamilyValue = evt.detail.value;
        this.newProduct.Family = evt.target.value;
    }

    createProduct(evt) {
        createNewProduct({product: this.newProduct})
            .then(result => {
                this.newProduct = {
                    Name: '',
                    Description: '',
                    Type: '',
                    Family: '',
                    Image: '',
                    Price: 0
                };
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product created',
                        variant: 'success',
                    }),
                );
            })
            .error(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            })
    }
}