export const config = {
  appName: process.env.APP_NAME ?? "Hivebox",
  version: process.env.VERSION ?? "0.0.1",
  env: process.env.ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
}
