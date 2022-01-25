'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// 数据的位数在这里进行控制
const BIT = 2;
// 要测试的函数在这里进行控制
const FUNCTION = "InsertDataIntvec";
// 使用的用户
const USER = "User1";

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // assets = 100
        // 数据量要在benchmark中控制
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            let n = Math.floor(Math.random() * (Math.pow(10, BIT) - Math.pow(10, BIT - 1)) + Math.pow(10, BIT - 1))
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}, n: ${n}`);       
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: FUNCTION,
                invokerIdentity: USER,
                contractArguments: [assetID, n.toString()],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
    
    async submitTransaction() {
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetSumIntvec',
            invokerIdentity: USER,
            contractArguments: [],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(myArgs);
    }
    
    async cleanupWorkloadModule() {
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'DeleteData',
            invokerIdentity: USER,
            contractArguments: [],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }
        
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
