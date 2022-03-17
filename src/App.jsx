import React from "react";
import Web3 from 'web3';
import MintTicket from './MintTicket.json'
import { create } from 'ipfs-http-client';
import CID from 'cids'
import axios from 'axios'


const test = {
  "title" : "test data",
  "content": "test content"
}


const ipfs = create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});

async function uploadData() {
  try {
    const uploadResult = await ipfs.add(JSON.stringify(test))
    console.log(uploadResult)
    console.log(uploadResult.path)

    const cid = new CID(uploadResult.path).toV1().toString('base32')
    axios.get(`https://ipfs.io/ipfs/${cid}`)
    .then(res => {
      console.log(res.data)
    })
  } catch(e) {
    console.log(e)
  }
}

let web3 = new Web3("http://20.196.209.2:8545");

async function send(transaction) {
    let gas = await transaction.estimateGas({from: '0x2418B0cea93A6efC494DB419A24a0186d4C6065F'});
    let options = {
        to  : transaction._parent._address,
        data: transaction.encodeABI(),
        gas : gas
    };
    let signedTransaction = await web3.eth.accounts.signTransaction(options, '0xb492301336976866218b482de63c470efec9749fefa9e5317b16de00bd73f511');
    return await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

}

async function deployContract() {
    // let abi = fs.readFileSync(BINARY_DIR + contractName + ".abi").toString();
    // let bin = fs.readFileSync(BINARY_DIR + contractName + ".bin").toString();
    let contract = new web3.eth.Contract(MintTicket.abi);
    let handle = await send(contract.deploy({ data: MintTicket.bytecode }));
    console.log(`contract deployed at address ${handle.contractAddress}`);
    const result = new web3.eth.Contract(MintTicket.abi, handle.contractAddress);
    console.log(result)
    return result
}

let myContract = new web3.eth.Contract(
	MintTicket.abi,
	"0x1a9CFaD26c4C82708d8A4583C1Cf9E4a48e2811a"
)
console.log(myContract)
const mintToken = async () => {
  
  const tmp = myContract.methods.mintTicket()
  console.log(tmp)
  let handle = await send(tmp);
  console.log(handle)
}

const App = () => {
  return (
    <>
      {/* <button onClick={(function() {myContract = deployContract()})()}>asdfasdf</button> */}
      <button onClick={mintToken}>MINT</button>
      <button onClick={uploadData}>Upload to ipfs</button>
    </>
  )
};

export default App;
