import Y from "yjs";
import yjson from "../../src";

const doc = new Y.Doc();
const store = yjson(doc, "storage");

if (store.count === undefined)
  store.count = 0;

store.observe((events) =>
{
  console.log(events[0].changes.keys);
});

document.getElementById("increment")?.addEventListener("click", () =>
{
  store.count++;
});