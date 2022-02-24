/*
 * @Author: Wen Jiajun
 * @Date: 2022-02-24 14:01:11
 * @LastEditors: Wen Jiajun
 * @LastEditTime: 2022-02-24 14:26:25
 * @FilePath: \caliper-experiment\workload\handleRequest.js
 * @Description: 
 */

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// function to test
const SUBMIT_FUNCTION = "HandleSingle";
const SUBMIT_FUNCTION2 = "SendResponse";
// user identidy
const USER = "User1";


class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // insert some requests for handling
        for (let i=0; i<this.roundArguments.assets; i++) {
            // requestID
            const requestID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating request ${requestID}`);

            // parameter generating
            let tableID = 1; // one table only
            let attributeID = [math.floor(math.random() * 10)]; // suppose we have 10 attributes for each table
            let proposal = math.floor(math.random() * 2); // two kinds of services provided
            let requestTime = new Date();
            
            // construct the request
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'SendRequest',
                invokerIdentity: USER,
                contractArguments: [requestID, tableID, attributeID, proposal, requestTime],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
    
    // Testing HandleSingle() and SendResponse()
    async submitTransaction() {
        const randomId = Math.floor(Math.random()*this.roundArguments.assets);
        // construct the request for HandleSingle()
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: SUBMIT_FUNCTION,
            invokerIdentity: USER,
            contractArguments: [`${this.workerIndex}_${randomId}`],
            readOnly: true,
        };

        // Get the response
        let res = await this.sutAdapter.sendRequests(request);

        // construct the request for SendResponse()
        const request2 = {
            contractId: this.roundArguments.contractId,
            contractFunction: SUBMIT_FUNCTION2,
            invokerIdentity: USER,
            contractArguments: [res.toString()],
            readOnly: false,
        }
        await this.sutAdapter.sendRequests(request2);
    }
    
    async cleanupWorkloadModule() {
        // Clean the ledger
        // we alse clean the private data collection for org2 in order to test ReadResponse()
        for (let index = 0; index < this.roundArguments.assets; index++){
            console.log(`Deleting request: ${this.workerIndex}_${index}`)
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteRequest',
                invokerIdentity: USER,
                contractArguments: [`${this.workerIndex}_${index}`],
                readOnly: false
            };
    
            const request2 = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteResponse',
                invokerIdentity: USER,
                contractArguments: [`${this.workerIndex}_${index}`],
                readOnly: false
            };
            await this.sutAdapter.sendRequests(request);
            await this.sutAdapter.sendRequests(request2);
        }

    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

