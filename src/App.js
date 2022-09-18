import './App.css';

import GuarantorDeal from './GuarantorDeal';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import {Box, Button, Container, FormControl, FormLabel, Paper, TextField, Typography} from "@mui/material";

function App() {
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();
  const [amountToSend, setAmountToSend]= useState(0);
  const [recipient, setRecipient]= useState();
  const [guarantor, setGuarantor]= useState();
  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    async function load() {
      const account = await web3.eth.requestAccounts();
      window.ethereum.on('accountsChanged', function (accounts) {
        setAccount(accounts[0])
      })

      setAccount(account[0]);
    }

    load();
  }, [account]);

  useEffect(() => {
    if (account !== undefined) {
      web3.eth.getBalance(account).then(setBalance);
    }
  }, [account])

  async function sendMoney() {
    if (account !== undefined) {
      new web3.eth.Contract(GuarantorDeal.abi).deploy({
        data: GuarantorDeal.bytecode,
        arguments: [recipient, guarantor]
      }).send({
        value: web3.utils.toWei(amountToSend, 'ether'),
        from: account
      }, (err, transactionHash) => {
        console.log('Transaction Hash :', transactionHash);
      }).on('error', function(error){ console.log(error) })
        .on('transactionHash', function(transactionHash){ console.log("TX hash", transactionHash) })
        .on('receipt', function(receipt){
          console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', function(confirmationNumber, receipt){ console.log("confirmation", confirmationNumber, receipt) })
        .then(function(newContractInstance){
          console.log(newContractInstance.options.address) // instance with the new contract address
        });
      // const deployedNetwork = GuarantorDeal.networks[netId];
      // console.log(deployedNetwork);
      // const contract = new web3.eth.Contract(
      //   GuarantorDeal.abi,
      //   deployedNetwork.address
      // );
      // contract.methods.count().call(); // TODO
    }
  }

  return (
    <div className="App">
      <Box>
          <Typography>Your account: {account}</Typography>
          {balance !== undefined ? (
            <Typography>Current balance: {web3.utils.fromWei(balance)} ETH</Typography>
          ): null}
      </Box>
      <Box sx={{
        p:4,
        '& .MuiTextField-root': { m: 1, width: '45ch' },
      }}>
        <FormControl>
          <FormLabel>Send ETH</FormLabel>
          <TextField label="Amount" variant="outlined" onChange={(e) => setAmountToSend(e.target.value)} />
          <TextField label="Recipient address" onChange={(e) => setRecipient(e.target.value)} variant="outlined" />
          <TextField label="Guarantor address" onChange={(e) => setGuarantor(e.target.value)}  variant="outlined" />
          <Button variant="contained" onClick={(e) => sendMoney()}>Send</Button>
        </FormControl>


      </Box>
    </div>
  );
}

export default App;
