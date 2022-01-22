'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
// 数据的位数在这里进行控制
const BIT = 3;
// 要测试的函数在这里进行控制
// Available options: InsertData, InsertDataIntvec
const FUNCTION = "InsertDataIntvec";
// 使用的用户
const USER = "User1";

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        // 在初始话阶段什么也不做
        console.log("Nothing to do for the initialization, ready for the test")
    }
    
    // 测试插入数据
    async submitTransaction() {
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
