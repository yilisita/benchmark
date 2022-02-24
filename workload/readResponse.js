/*
 * @Author: Wen Jiajun
 * @Date: 2022-02-24 14:11:18
 * @LastEditors: Wen Jiajun
 * @LastEditTime: 2022-02-24 14:25:24
 * @FilePath: \caliper-experiment\workload\readResponse.js
 * @Description: 
 */
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
const SUBMIT_FUNCTION = "ReadResponse";
// user identidy
const USER = "User1";


class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // insert some responses for reading
        /* ID          string   `json:"ID"`
         * TableName   string   `json:"TableName"`
         * Attribute   []string `json:"Attribute"`
         * ProposalStr string   `json:"Target"`
         * RequestTime string   `json:"RequestTime"`
         * Amount float64 `json:"Amount"`
         */
        for (let i=0; i<this.roundArguments.assets; i++) {
            // requestID
            const responseID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating request ${requestID}`);

            // parameter generating
            let tableName = `Table_${i}`; // tableName: string
            let attribute = ["ZhuangjiRongliang"]; // attribute []string
            let proposal = `Sum`; // two kinds of services provided
            let requestTime = new Date();
            let amount = math.random() * 10000;
            
            let response = {
                "ID": responseID,
                "TableName": tableName,
                "Attribute": attribute,
                "ProposalStr": proposal,
                "RequestTime": requestTime,
                "Amount": amount
            }
            // construct the request
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'SendResponse',
                invokerIdentity: USER,
                contractArguments: [response.toString()],
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
            console.log(`Deleting response: ${this.workerIndex}_${index}`)
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteResponse',
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
