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
            let n = Math.floor(Math.random() * (Math.pow(10, BIT) - Math.pow(10, BIT - 1)) + Math.pow(10, BIT - 1))
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}, n: ${n}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: FUNCTION,
                invokerIdentity: USER,
                contractArguments: [assetID, n.toString()],
                readOnly: true
            };

            await this.sutAdapter.sendRequests(request);
        }
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
