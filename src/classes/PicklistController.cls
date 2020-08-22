public with sharing class PicklistController {

	@AuraEnabled(cacheable=true)
	public static List<Map<String, String>> getFamilyValues(){
		list<Map<String, String>> familyValues= new List<Map<String, String>>();
		Schema.DescribeFieldResult fieldResult = Product__c.Family__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		Integer i = 1;
		for(Schema.PicklistEntry pickListVal : ple){
			familyValues.add(new Map<String, String>{
				'Id' => String.valueOf(i),
				'Value' => pickListVal.getLabel()
			});
			i++;
		}
		return familyValues;
	}

	@AuraEnabled(cacheable=true)
	public static List<Map<String, String>> getTypeValues(){
		List<Map<String, String>> typeValues= new List<Map<String, String>>();
		Schema.DescribeFieldResult fieldResult = Product__c.Type__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		Integer i = 1;
		for(Schema.PicklistEntry pickListVal : ple){
			typeValues.add(new Map<String, String>{
				'Id' => String.valueOf(i),
				'Value' => pickListVal.getLabel()
			});
			i++;
		}
		return typeValues;
	}

}