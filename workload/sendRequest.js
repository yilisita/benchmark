/*
 * @Author: Wen Jiajun
 * @Date: 2022-01-25 12:06:55
 * @LastEditors: Wen Jiajun
 * @LastEditTime: 2022-02-24 14:33:22
 * @FilePath: \caliper-experiment\workload\sendRequest.js
 * @Description: 
 */
'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// function to test
const SUBMIT_FUNCTION = "SendRequest";
// user identidy
const USER = "User1";

const maxAssets = 1000000;

var idPool = []

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        console.log("Nothing to do for the initialization, ready for the test")
    }
    
    // 测试插入数据
    async submitTransaction() {
        // id, TableID string, attributeID []int, proposal int, requetsTime string
        let i = math.floor(math.random() * maxAssets);
        const ID = `${this.workerIndex}_${i}`; 
        // push ID to idPool for deletion use
        idPool.push(ID)           
        console.log(`Worker ${this.workerIndex}: Sending request ${ID}`);

        // parameter generating
        let tableID = math.floor(math.random() * 100); // suppose we have 100 tables
        let attributeID = [math.floor(math.random() * 13)]; // suppose we have 13 attributes for each table
        let proposal = math.floor(math.random() * 2); // two kinds of services provided
        let requestTime = new Date();

        // construct the reequest
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: SUBMIT_FUNCTION,
            invokerIdentity: USER,
            contractArguments: [ID, tableID, attributeID, proposal, requestTime],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
        
    }
    
    async cleanupWorkloadModule() {
        // Delete the repeated elements in idpool
        let tmp = new Array();
            for(let i = 0; i < idPool.length; i++ ){
                // -1 indicates it's not in temp
                if(tmp.indexOf(idPool[i])==-1){
                    tmp.push(idPool[i]);
                }
            }

        // Clean the ledger
        for (let index = 0; index < tmp.length; index++){
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteRequest',
                invokerIdentity: USER,
                contractArguments: [tmp[index]],
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
