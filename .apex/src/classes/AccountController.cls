public with sharing class AccountController {

	@AuraEnabled(cacheable=true)
	public static Account getAccountInfo(String key) {
		return [
				SELECT Id, Name, AccountNumber
				FROM Account
				WHERE Id =:key
		];
	}

	@AuraEnabled(cacheable=true)
	public static List<Account> getAccountList() {
		return [
				SELECT Id, Name, AccountNumber
				FROM Account
				LIMIT 10
		];
	}

}