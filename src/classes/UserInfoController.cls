public with sharing class UserInfoController {
	@AuraEnabled(cacheable=true)
	public static User getUserDetails(String recId) {
		return  [Select Id, Name, IsManager__c from User where Id =:recId];
	}
}