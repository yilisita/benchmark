'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// 数据的位数在这里进行控制
const BIT = 3;
// 要测试的函数在这里进行控制
const FUNCTION = "InsertData";
// 使用的用户
const USER = "User1";

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        let sum;
        // assets = 100
        // 数据量要在benchmark中控制
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}`);
            let n = Math.floor(Math.random() * Math.pow(10, BIT))
            if (n < Math.pow(10, BIT - 1)){
                n += Math.pow(10, BIT - 1)
            }
            
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
        const randomId = Math.floor(Math.random()*this.roundArguments.assets);
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetSum',
            invokerIdentity: USER,
            contractArguments: [],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(myArgs);
    }
    
    async cleanupWorkloadModule() {
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteData',
                invokerIdentity: USER,
                contractArguments: [assetID],
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
