import { Result, ResultAsync, okAsync, errAsync, fromAsyncThrowable, fromPromise,  } from "neverthrow";
import { Db } from "./DbConnectionPool";



export async function initialize_database() {
  const result = fromAsyncThrowable(Db.initialize);
  
  result().match(
    (ds: object) => { console.log("\x1b[34m[DbConn@1.12.4]\x1b[0m Database connected"); },
    (err: any) => { console.error("\x1b[31m[DbConn@1.12.4]\x1b[0m Error during DataSource initialization ", err); }
  );
}