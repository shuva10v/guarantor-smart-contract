import './App.css';

import { useEffect, useState } from 'react';
import Web3 from 'web3';
import {Button, Container, Typography} from "@mui/material";

function App() {
  const [account, setAccount] = useState(); // state variable to set account.
  const web3 = new Web3(window.ethereum);//new Web3(Web3.givenProvider);

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

  function disconnect() {
    console.log(web3.eth.currentProvider.disconnect)
  }

  return (
    <div className="App">
      <Container>
          <Typography>Your account: {account}</Typography>
      </Container>
      <Container sx={{p:4}}>
        <Button variant="contained" onClick={(e) => disconnect()}>Exit</Button>
      </Container>
    </div>
  );
}

export default App;
