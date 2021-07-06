import Y from "yjs";

export const yjson:
  <T = { [key: string]: any }>(doc: Y.Doc, name?: string) =>
  T &
  {
    observe: (callback: (events: Array<Y.YEvent>, transaction: Y.Transaction) => void) => void,
  };

export default yjson;