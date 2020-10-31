import React, { useCallback, useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

import classes from "./MyWallet.module.css";
import Logo from "../../components/Logo/Logo";

import onegaiLogo from "../../assets/images/onegai-logo.png";
import { Button } from "../../components";

const MyWallet = (props) => {
  const [publicAddress, setPublicAddress] = useState();
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetch(`api/wallet-info`)
      .then((response) => response.json())
      .then((json) => {
        setPublicAddress(json.address);
        setWalletBalance(json.balance);
      });
  }, []);

  return (
    <div className={classes.MyWallet}>
      <Logo height={"200px"} image={onegaiLogo} />
      <h1>Welcome to Onegai Blockchain</h1>
      <br />
      <div className={classes.WalletInfo}>
        <div>My Public Address</div>
        <div>
          <input value={publicAddress} className={classes.PublicAddress} disabled />

          <CopyToClipboard text={publicAddress}>
            <Button
              btnType="Success"
              onClick={() => console.log("Click liao oo")}
            >
              Copy
            </Button>
          </CopyToClipboard>
        </div>
        <br />
        <div>My Balance</div>
        <div className={classes.Balance}>{walletBalance}</div>
      </div>
    </div>
  );
};

export default MyWallet;
