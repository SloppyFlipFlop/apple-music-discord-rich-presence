declare module "applescript" {
  export function execString(
    script: string,
    callback: (err: any, result: any) => void
  ): void;
}
