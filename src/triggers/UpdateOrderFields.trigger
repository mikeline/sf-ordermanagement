trigger UpdateOrderFields on OrdItem__c (after insert) {

	Map<ID, Order__c> parentOrders = new Map<Id, Order__c>();
	List<Id> listIds = new List<Id>();

	for (OrdItem__c orderItem : Trigger.new) {
		listIds.add(orderItem.OrderId__c);
	}

	parentOrders = new Map<Id, Order__c>([SELECT Id, TotalPrice__c, TotalProductCount__c, (SELECT Id, Price__c, Quantity__c FROM OrdItems__r) FROM Order__c WHERE Id IN :listIds]);

	for (OrdItem__c orderItem: Trigger.new) {
		Order__c parentOrder = parentOrders.get(orderItem.OrderId__c);
		parentOrder.TotalPrice__c += orderItem.Price__c;
		parentOrder.TotalProductCount__c += orderItem.Quantity__c;
	}

	update parentOrders.values();
	System.debug('Successfully updated in trigger');
}