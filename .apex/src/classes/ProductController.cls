public with sharing class ProductController {

	@AuraEnabled(cacheable=true)
	public static List<Product__c> getProductList(String searchKey) {
		String key = '%' + searchKey + '%';
		return [
				SELECT Id, Name, Description__c, Family__c, Type__c, Price__c
				FROM Product__c
				WHERE Name LIKE :key
				LIMIT 20
		];
	}

	@AuraEnabled(cacheable=true)
	public static Product__c getProductDetail(String prodId) {
		return [
				SELECT Id, Name, Description__c, Family__c, Type__c, Image__c, Price__c
				FROM Product__c
				WHERE Id =:prodId
		];
	}

	@AuraEnabled
	public static void createNewProduct(Map<String, Object> product) {
		try {
			Product__c newProduct = new Product__c(
					Name = (String)product.get('Name'),
					Description__c = (String)product.get('Description'),
					Type__c = (String)product.get('Type'),
					Family__c = (String)product.get('Family'),
					Image__c = (String)product.get('Image'),
					Price__c = Integer.valueOf(product.get('Price'))
			);
			insert newProduct;
			System.debug('Successfully created product');
		} catch (DmlException e) {
			System.debug('An unexpected error has occurred: ' + e.getMessage());
		}

	}
}