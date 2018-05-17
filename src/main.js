const httpUtils = require("./httpUtils.js");
const blockUtils = require("./blockUtils.js");

blockUtils.InitializeBlockChain();

httpUtils.connectToPeers();
httpUtils.initHttpServer();
httpUtils.initP2PServer();
