export class Log {
  // Print based log for now
  public static warning(message: string) {
    console.log(`[WARN] ${message}`);
  }

  public static error(message: string) {
    console.log(`[ERROR] ${message}`);
  }

  public static info(message: string) {
    console.log(`[INFO] ${message}`);
  }

  public static debug(message: any) {
    var result: string;
    if (typeof message === "string") {
      result = message;
    } else {
      const seen = new WeakSet();

      result = JSON.stringify(
        message,
        (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return undefined; // remove circular reference
            }

            seen.add(value);
          }

          return value;
        },
        3,
      );
    }

    console.log(`[DEBUG] [${Date.now()}] ${result}`);
  }
}
