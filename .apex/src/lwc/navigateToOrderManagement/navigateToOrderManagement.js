import {LightningElement} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavigateToOrderManagement extends NavigationMixin(LightningElement) {

    navigateNext(event) {
        let recordId = window.location.href;
        recordId = recordId.split('/');
        recordId = recordId[recordId.length - 2];
        let urlToOpen = 'https://orderify-dev-ed.lightning.force.com/lightning/n/Order_Management?c__id=' + recordId;
        window.location.href = urlToOpen;
    }
}