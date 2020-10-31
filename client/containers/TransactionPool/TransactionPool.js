import React, { useEffect, useState } from "react";
import { Button, Transaction } from "../../components";
import classes from "./TransactionPool.module.css";

const POLL_INTERVAL_MS = 5 * 1000; //10 seconds

const TransactionPool = (props) => {
  const [transactionPoolMap, setTransactionPoolMap] = useState({});

  const fetchTransactionPoolMap = () => {
    fetch(`api/transaction-pool-map`)
      .then((response) => response.json())
      .then((json) => {
        setTransactionPoolMap(json);
      });
  };

  const mineTransaction = () => {
    fetch(`/api/mine-transactions`).then((response) => {
      if (response.status === 200) {
        alert("Success mining");
        props.history.push("/blocks");
      } else {
        alert("The mine-transaction did not complete");
      }
    });
  };

  useEffect(() => {
    fetchTransactionPoolMap();

    const interval = setInterval(() => {
      fetchTransactionPoolMap();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const transactionData =
    Object.keys(transactionPoolMap).length === 0 ? (
      <div>No Transaction in this Moment.</div>
    ) : (
      Object.values(transactionPoolMap).map((transaction) => {
        return (
          <div key={transaction.id}>
            <hr />
            <Transaction transaction={transaction} />
          </div>
        );
      })
    );

  return (
    <div className={classes.TransactionPool}>
      <h3>Transaction Pool</h3>
      {transactionData}
      <hr />
      <Button btnType="Danger" onClick={mineTransaction}>
        Mine the transaction
      </Button>
    </div>
  );
};

export default TransactionPool;
