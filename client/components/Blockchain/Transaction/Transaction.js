import React from "react";
import classes from "./Transaction.module.css";
import ReactTooltip from "react-tooltip";

const Transaction = (props) => {
  const { input, outputMap } = props.transaction;
  const recipients = Object.keys(outputMap);

  const displayAddress =
    input.address.length <= 20
      ? input.address
      : `${input.address.substring(0, 20)}...`;

  const displayBalanceTitle =
    input.address === "*authorized-reward*" ? "" : "Balance : ";

  return (
    <div className={classes.Transaction}>
      <div className={classes.SenderLine}>
        <div
          className={classes.TransactionLine}
          data-tip={input.address}
          data-for="contentToolTip"
        >
          Sender: {displayAddress}
        </div>

        <div className={classes.TransactionLine}>| {displayBalanceTitle}{input.amount}</div>
      </div>
      {recipients.map((recipient) => {
        const displayRecipientTitle =
          recipient === input.address ? "Sender: " : "Recipient: ";

        const displayRecipient =
          recipient.length <= 20
            ? recipient
            : `${recipient.substring(0, 20)}...`;

        const displayAmountTitle =
          recipient === input.address ? "After-balance: " : "Sent: ";

        return (
          <div key={recipient}>
            <div
              className={classes.TransactionLine}
              data-tip={recipient}
              data-for="contentToolTip"
            >
              {displayRecipientTitle} {displayRecipient}
            </div>

            <div className={classes.TransactionLine}>
              | {displayAmountTitle} {outputMap[recipient]}
            </div>
          </div>
        );
      })}
      {/* display tool tip  */}
      <ReactTooltip
        id="contentToolTip"
        getContent={(dataTip) => `${dataTip}`}
        place="top"
        effect="solid"
      />
    </div>
  );
};
export default Transaction;
