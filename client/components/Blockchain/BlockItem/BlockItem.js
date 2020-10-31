import React, { useState } from "react";
import classes from "./BlockItem.module.css";
import ReactTooltip from "react-tooltip";

import { Transaction, Button } from "../../";

const BlockItem = (props) => {
  const [displayTransaction, setDisplayTransaction] = useState(false);

  const { timestamp, hash, data } = props.block;
  const stringifiedData = JSON.stringify(data);
  const hashDisplay = hash.length > 40 ? `${hash.substring(0, 15)}...` : hash;
  const dataDisplay =
    stringifiedData.length > 15
      ? `${stringifiedData.substring(0, 15)}...`
      : stringifiedData;

  const toggleTransaction = () => {
    setDisplayTransaction(!displayTransaction);
  };

  let transaction = (
    <div>
      <div>
        <div>Data: {dataDisplay}</div>
        <Button btnType="Danger" onClick={toggleTransaction}>
          Show more
        </Button>
      </div>
    </div>
  );

  if (displayTransaction) {
    transaction = (
      <div>
        {data.map((transaction) => (
          <div key={transaction.id}>
            <hr />
            <Transaction transaction={transaction} />
          </div>
        ))}
        <br />
        <Button btnType="Success" onClick={toggleTransaction}>
          Show less
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.Block}>
      <h1>Block #{props.index}</h1>
      <div data-tip={hash} data-for="hashTooltip">
        Hash: {hashDisplay}
      </div>
      <div>Timestamp: {new Date(timestamp).toString()}</div>
      {transaction}
      {/* display tool tip  */}
      <ReactTooltip
        id="hashTooltip"
        getContent={(dataTip) => `${dataTip}`}
        place="top"
        effect="solid"
      />
    </div>
  );
};

export default BlockItem;
