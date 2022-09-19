import './App.css';

import GuarantorDeal from './GuarantorDeal';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Paper, Snackbar,
  TextField,
  Typography
} from "@mui/material";

function App() {
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();
  const [amountToSend, setAmountToSend]= useState(0);
  const [dealId, setDealId]= useState(0);
  const [recipient, setRecipient]= useState();
  const [guarantor, setGuarantor]= useState();
  const [alert, setAlert] = useState();
  const [deal, setDeal] = useState();
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

  useEffect(() => {
    // TODO
    console.log(dealId);
  }, [dealId])

  function onCloseAlert() {
    setAlert(undefined);
  }

  async function contract() {
    const deployedNetwork = GuarantorDeal.networks[await web3.eth.net.getId()];
    return new web3.eth.Contract(
      GuarantorDeal.abi,
      deployedNetwork.address
    );
  }

  async function getDeal() {
    if (account !== undefined && dealId !== undefined) {
      (await contract()).methods.getDeal(dealId).call().then((res) => {
        setDeal(res);
      }).catch((e) => {
        console.log(e);
        setAlert({text: e.message, severity: 'error'});
      })
    }                      c
  }

  async function dealAction(action) {
    if (account !== undefined && dealId !== undefined) {
      // web3.eth.handleRevert = true;
      (await contract()).methods[action](dealId).call().then((res) => {
        setAlert({text: 'Action ' + action + ' finished', severity: 'info'});
        getDeal();
      }).catch((e) => {
        console.log(e);
        setAlert({text: e.message, severity: 'error'});
      })
    }
  }

  async function createDeal() {
    if (account !== undefined) {

      setCreatingDeal(true);
      (await contract()).methods.create(recipient, guarantor).send({
        value: web3.utils.toWei(amountToSend, 'ether'),
        from: account
      }, (err, transactionHash) => {
        console.log('Transaction Hash :', transactionHash);
      }).on('error', function(error){
        console.log(error);
        setAlert({text: error, severity: 'error'});
        setCreatingDeal(false);
      })
        .on('transactionHash', function(transactionHash){ console.log("TX hash", transactionHash) })
        .on('receipt', function(receipt){
          console.log(receipt.contractAddress); // contains the new contract address
          setCreatingDeal(false);
          setAlert({
            text: "New deal created: #" + receipt?.events?.NewDeal?.returnValues?.dealId,
            severity: 'info'
          });
        })
        .on('confirmation', function(confirmationNumber, receipt){ console.log("confirmation", confirmationNumber, receipt) });
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
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {creatingDeal ? <CircularProgress/> : null}
          <Box sx={{
            p:4,
            '& .MuiTextField-root': { m: 1, width: '45ch' },
          }}>
            <FormControl>
              <FormLabel>Create deal</FormLabel>
              <TextField label="Amount in ETH" disabled={creatingDeal} variant="outlined" onChange={(e) => setAmountToSend(e.target.value)} />
              <TextField label="Recipient address" disabled={creatingDeal} onChange={(e) => setRecipient(e.target.value)} variant="outlined" />
              <TextField label="Guarantor address" disabled={creatingDeal} onChange={(e) => setGuarantor(e.target.value)}  variant="outlined" />
              <Button variant="contained" disabled={creatingDeal} onClick={createDeal}>Send</Button>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{
            p:4,
            '.MuiTextField-root': { m: 1, width: '45ch' },
          }}>
            <FormControl>
              <FormLabel>
                Deal actions
              </FormLabel>
              <TextField label="Deal ID" variant="outlined" onChange={(e) => setDealId(e.target.value)} />
              <Button variant="contained" onClick={getDeal}>Get deal info</Button>
            </FormControl>
            {deal !== undefined ? (
              <Box sx={{pt:2}}>
                <Typography>
                  Seller: {deal.seller}
                </Typography>
                <Typography>
                  Buyer: {deal.buyer}
                </Typography>
                <Typography>
                  Guarantor: {deal.guarantor}
                </Typography>
                <Typography>
                  Amount: {web3.utils.fromWei(deal.amount)} ETH
                </Typography>
                <Typography>
                  Status: {deal.approved ? 'Approved' : 'Waiting for guarantor approve'}
                </Typography>
                <FormControl margin='dense'>
                  {account === deal.guarantor ? (<Button variant="contained" onClick={() => dealAction('approve')}>Approve</Button>): null}
                  {account === deal.seller && deal.approved ? (<Button variant="contained" onClick={() => dealAction('withdraw')}>Withdraw</Button>): null}
                  {account === deal.seller && !deal.approved? (<Button variant="contained" onClick={() => dealAction('refund')}>Refund</Button>): null}
                </FormControl>
              </Box>
            ) : null}
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={alert !== undefined} autoHideDuration={6000} onClose={onCloseAlert}>
        <Alert onClose={onCloseAlert} severity={alert?.severity} sx={{ width: '100%' }}>
          {alert?.text}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
