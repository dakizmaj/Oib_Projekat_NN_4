import { okAsync, errAsync } from "neverthrow";
import { DATABASE_DATASOURCE } from "./DbConnectionPool";



export async function initializeDatabase() {
  const result = await wrappedInitialize();
  
  result.match(
    (ds: void) => { console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected"); },
    (err: any) => {
      console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization (Read below):");
      console.error(err);
    }
  );
}



async function wrappedInitialize() {
  try {
    await DATABASE_DATASOURCE.initialize();
    return okAsync();
  }
  catch (err) {
    return errAsync(err);
  }
}