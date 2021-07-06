import Y from "yjs";

interface IYJSON
{
  observe: (callback: (events: Array<Y.YEvent>, transaction: Y.Transaction) => void) => void;
}

export type YJSON<T = { [key: string]: any }> = IYJSON & T;

export const yjson: <T = { [key: string]: any }>(doc: Y.Doc, name?: string) => YJSON<T>;

export default yjson;