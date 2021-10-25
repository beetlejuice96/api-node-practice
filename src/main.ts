import { startServer } from "./server";

import { connect } from "./config/typeorm";

const main = async () => {
  try {
    connect();
  } catch (error) {
    console.log(error);
  }

  const port: number = 4000;
  const app = await startServer();
  app.listen(port);
  console.log(`app running on port ${port}`);
};

main();
