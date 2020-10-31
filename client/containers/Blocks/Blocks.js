import React, { useCallback, useState } from "react";
import classes from "./Blocks.module.css";

import { BlockItem, Button } from "../../components";

const Blocks = (props) => {
  const [blocks, setBlocks] = useState([]);
  const [paginatedId, setPaginatedId] = useState(1);
  const [blockLength, setBlockLength] = useState(0);

  const fetchPaginatedBlocks = useCallback(
    (paginatedId) => {
      setPaginatedId(paginatedId);
      fetch(`/api/blocks/${paginatedId}`)
        .then((response) => response.json())
        .then((json) => setBlocks(json));
    },
    [blocks, paginatedId]
  );

  ////#region Old code
  // const fetchBlocks = () => {
  //   fetch(`/api/blocks`)
  //     .then((response) => response.json())
  //     .then((json) => {
  //       setBlocks(json);
  //     });
  // };
  //#endregion Old code

  useState(() => {
    // fetchBlocks();

    fetch(`/api/blocks/length`)
      .then((response) => response.json())
      .then((json) => setBlockLength(json));

    fetchPaginatedBlocks(paginatedId);
  }, []);

  return (
    <div className={classes.Blocks}>
      <div>
        {[...Array(Math.ceil(blockLength / 5)).keys()].map((key) => {
          const currPaginatedId = key + 1;

          return (
            <span
              key={key}
              onClick={() => fetchPaginatedBlocks(currPaginatedId)}
            >
              <Button btnType="Warning">
                {currPaginatedId}
              </Button>
            </span>
          );
        })}
      </div>
      <div>Current Page: {paginatedId}</div>
      {blocks.map((block) => {
        return <BlockItem key={block.hash} block={block} index={block.blockId} />;
      })}
    </div>
  );
};

export default Blocks;
