/*
 * @Author: Wen Jiajun
 * @Date: 2022-02-24 13:46:27
 * @LastEditors: Wen Jiajun
 * @LastEditTime: 2022-02-24 13:54:47
 * @FilePath: \caliper-experiment\workload\readRequest.js
 * @Description: 
 */
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// function to test
const SUBMIT_FUNCTION = "ReadRequest";
// user identidy
const USER = "User1";


class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // insert some requests for reading
        for (let i=0; i<this.roundArguments.assets; i++) {
            // requestID
            const requestID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating request ${requestID}`);

            // parameter generating
            let tableID = math.floor(math.random() * 100); // suppose we have 100 tables
            let attributeID = [math.floor(math.random() * 13)]; // suppose we have 13 attributes for each table
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
    
    // Testing ReadRequest()
    async submitTransaction() {
        const randomId = Math.floor(Math.random()*this.roundArguments.assets);
        // construct the request
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: SUBMIT_FUNCTION,
            invokerIdentity: USER,
            contractArguments: [`${this.workerIndex}_${randomId}`],
            readOnly: true,
        };

        await this.sutAdapter.sendRequests(request);
        
    }
    
    async cleanupWorkloadModule() {
        // Clean the ledger
        for (let index = 0; index < this.roundArguments.assets; index++){
            console.log(`Deleting request: ${this.workerIndex}_${index}`)
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteRequest',
                invokerIdentity: USER,
                contractArguments: [`${this.workerIndex}_${index}`],
                readOnly: false
            };
    
            await this.sutAdapter.sendRequests(request);
        }

    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
