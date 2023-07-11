import { LightningElement, api, track, wire } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import publishEvent from '@salesforce/apex/NMS_UsersViewingRecordLiveController.publishEvent';
import getLiveUsersOnRecord from '@salesforce/apex/NMS_UsersViewingRecordLiveController.getLiveUsersOnRecord';


export default class Nms_UsersViewingRecordLive extends LightningElement {
    @api channelName = '/event/User_Viewing_Record__e';
    @api recordId;
    timer;
    isError = false;
    @track liveUsersOnRecord = [];

   
    async connectedCallback() {    
        console.log("Hiii");   
        // Register error listener 
        this.handleloadComponent();
        window.addEventListener("beforeunload", () => {
            clearTimeout(this.timer);

            this.timer = setTimeout(() => {
                publishEvent({recordId : this.recordId, isConnect : false})
                    .then(result => {

                    })
                    .catch(error => {
                        console.log(error.body.message);
                    }),
                    300
            })
            
        });
        window.addEventListener("blur", () => {
            clearTimeout(this.timer);

            this.timer = setTimeout(() => {
                console.log('HII');
                publishEvent({recordId : this.recordId, isConnect : false})
                    .then(result => {

                    })
                    .catch(error => {
                        console.log(error.body.message);
                    }),
                    300
            })
        });
        window.addEventListener("focus", () => {
            clearTimeout(this.timer);

            this.timer = setTimeout(() => {
                console.log('HI')
                publishEvent({recordId : this.recordId, isConnect : true})
                    .then(result => {

                    })
                    .catch(error => {
                        console.log(error.body.message);
                    }),
                    300
            })
        });   
        await this.registerErrorListener();
        await this.handleSubscribe();

    }

    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = function(response) {
            
            var obj = JSON.parse(JSON.stringify(response));
            if(obj.data.payload.Record_Id__c === this.recordId){
                
                getLiveUsersOnRecord({recordId : this.recordId})
                    .then(result => {
                        this.liveUsersOnRecord = result;
                    })
                    .catch(error => {
                        console.log(error.body.message);
                    });
                // Response contains the payload of the new message received
            }
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback.bind(this)).then(response => {
            // Response contains the subscription information on subscribe call
            console.log('Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }

    // Handles unsubscribe button click
    handleUnsubscribe() {

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }
   
    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }

    disconnectedCallback(){
        this.handleUnloadComponent();
        window.removeEventListener("beforeunload", () => {
            publishEvent({recordId : this.recordId, isConnect : false})
                .then(result => {

                })
                .catch(error => {
                    console.log(error.body.message);
                })
        });
        window.removeEventListener("blur", () => {
            publishEvent({recordId : this.recordId, isConnect : false})
                .then(result => {

                })
                .catch(error => {
                    console.log(error.body.message);
                })
        });
        window.removeEventListener("focus", () => {
            publishEvent({recordId : this.recordId, isConnect : true})
                .then(result => {

                })
                .catch(error => {
                    console.log(error.body.message);
                })
        });
    }

    handleUnloadComponent () {
        publishEvent({recordId : this.recordId, isConnect : false})
            .then(result => {

            })
            .catch(error => {
                console.log(error.body.message);
            })
    }
    handleloadComponent () {
        publishEvent({recordId : this.recordId, isConnect : true})
            .then(result => {

            })
            .catch(error => {
                console.log(error.body.message);
            })
    }
}