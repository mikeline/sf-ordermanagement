public with sharing class OrderController {

	@AuraEnabled
	public static void createOrder(String accId, List<Map<String, Object>> items) {
		try {
			Order__c order = new Order__c(Name='NewOrder', AccountId__c=accId, TotalPrice__c = 0, TotalProductCount__c = 0);
			insert order;

			ID orderId = order.Id;
			List<OrdItem__c> orderItemsToInsert = new List<OrdItem__c>();
			for(Map<String, Object> item: items) {
				OrdItem__c orderItem = new OrdItem__c(
					OrderId__c = orderId,
					ProductId__c = (String)item.get('Id'),
					Quantity__c = Integer.valueOf(item.get('Quantity')),
					Price__c = Integer.valueOf(item.get('Price')) * Integer.valueOf(item.get('Quantity'))
				);
				orderItemsToInsert.add(orderItem);
			}
			insert orderItemsToInsert;
			System.debug('Successfully inserted');

		} catch (DmlException e) {
			System.debug('An unexpected error has occurred: ' + e.getMessage());
		}
	}
}