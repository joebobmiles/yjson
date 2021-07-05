# YJSON

[Yjs](https://github.com/yjs/yjs) is a brilliant JavaScript library for using
[Conflict-Free Replicated Data Types (CRDTs)](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type)
in the browser. *YJSON* wraps that library to make using Yjs as simple as
working with Plain Data Objects.

## Why?

Yjs's base API is nice and simple, but it is difficult to use when building
libraries with modern state-management paradigms, such as Redux, Mobx, or
Zustand. Looking for state-management frameworks that were built on Yjs, I found
that there were very few, particularly in the React space.

After trying to create a Redux clone backed by Yjs, I had learned why. What
would simplify things is to treat the store as a Yjs Map that contained other
shared types. This map would then be manipulated as a plain JSON object by the
state logic.

Thus, YJSON.

## What?

YJSON provides a function, `yjson` that accepts a Yjs Document and returns an
empty JSON object. This object is a 'store' whose contents are synced in the
background by Yjs. You don't need to worry about transforming back and forth
between shared types, as YJSON objects do that automatically, effectively hiding
that Yjs is involved at all.

## Example

```js
const Y = require("yjs");
const yjson = require("yjson").default;

// Create two new documents.
const doc1 = new Y.Doc();
const doc2 = new Y.Doc();

// When doc1 updates, apply the update to doc2.
doc1.on("update", (update) =>
{
    Y.applyUpdate(doc2, update);
});
// Vice-versa
doc2.on("update", (update) =>
{
    Y.applyUpdate(doc1, update);
});

// Create a YJSON object from each document.
const storeA = yjson(doc1);
const storeB = yjson(doc2);

// Add a key "foo" with value "bar" to storeA.
storeA.foo = "bar";

// Print the contents of storeB
console.log(storeB) // => { foo: "bar" }
```

## Caveats

 1. All YJSON objects sync together. What you do to one object, affects another
    object. This will be fixed later by assigning each new object a unique ID.
    Then only objects that have purposefully shared IDs will sync.
 2. You cannot create more than one YJSON object per Yjs Document. Each call of
    `yjson` creates a new empty object with the same ID as the last object,
    overwriting that object. Again, this will be fixed by providing each new
    object a unique ID.
 3. Yjs Text shared types are not supported. In the future, any string you put
    in a YJSON object will be transformed into Yjs Text instances.