@IsTest
public class OrderControllerTest {
	@IsTest
	static void test_createOrder() {
		// Set up test data set
		String accId = '0013V0000079GT5QAM';
		List<Map<String, Object>> items = new List<Map<String, Object>>();
		items.add(new Map<String, Object>{
			'Id' => 'a013V000003RFzCQAW',
			'Name' => 'Laptop White Xiaomi',
			'Price' => 400,
			'Quantity' => 2
		});

		items.add(new Map<String, Object>{
			'Id' => 'a013V000003QkYRQA0',
			'Name' => 'Keyboard Black',
			'Price' => 20,
			'Quantity' => 3
		});

		// Execute code with test data
		OrderController.createOrder(accId, items);  // call
	}

	@IsTest
	static void test_triggerOnOrdItems() {
		// Set up test data set
		String accId = '0013V0000079GT5QAM';
		String prodId1 = 'a013V000003RFzCQAW';
		String prodId2 = 'a013V000003QkYRQA0';
		List<Map<String, Object>> items = new List<Map<String, Object>>();
		items.add(new Map<String, Object>{
			'Id' => prodId1,
			'Name' => 'Laptop White Xiaomi',
			'Price' => 400,
			'Quantity' => 1
		});

		items.add(new Map<String, Object>{
			'Id' => prodId2,
			'Name' => 'Keyboard Black',
			'Price' => 20,
			'Quantity' => 2
		});

		// Execute code with test data
		OrderController.createOrder(accId, items);  // call

		Order__c order = [SELECT Id, TotalPrice__c, TotalProductCount__c, (SELECT Id, Price__c, Quantity__c FROM OrdItems__r WHERE ProductId__c =:prodId1) FROM Order__c];

		System.assertEquals(440, order.TotalPrice__c);
		System.assertEquals(3, order.TotalProductCount__c);
	}

}