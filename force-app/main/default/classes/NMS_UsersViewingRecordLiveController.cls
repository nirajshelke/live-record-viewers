public class NMS_UsersViewingRecordLiveController {
    @AuraEnabled
    public static void publishEvent(String recordId, Boolean isConnect){
		List<Live_Record_User_View__c> recordUsersList = [SELECT Id FROM Live_Record_User_View__c WHERE Record_Id__c =: recordId AND User__c =: UserInfo.getUserId()];
        if(recordUsersList.size() > 0){
        	delete recordUsersList; 
        }
        if(isConnect){
            insert new Live_Record_User_View__c(Record_Id__c = recordId, User__c = UserInfo.getUserId());   
        }
        
        List<User_Viewing_Record__e > eventList = new List<User_Viewing_Record__e >();
        eventList.add(new User_Viewing_Record__e(
            Record_Id__c 	= recordId,
            User_Id__c 		= UserInfo.getUserId(),
            IsConnect__c 	= isConnect
        ));
        
        
        // Call method to publish events
        List<Database.SaveResult> results = EventBus.publish(eventList);
        
        // Inspect publishing result for each event
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                 err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage());
                }
            }       
        }
        
    }
    
    @AuraEnabled
    public static List<Live_Record_User_View__c> getLiveUsersOnRecord(String recordId){
		return [SELECT Id, User__c, User__r.Name, CreatedDate, Record_Id__c,User_Initials__c  FROM Live_Record_User_View__c  WHERE Record_Id__c =: recordId];
    }

}