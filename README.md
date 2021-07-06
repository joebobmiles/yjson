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
const storeA = yjson(doc1, "shared");
const storeB = yjson(doc2, "shared");

// Add a key "foo" with value "bar" to storeA.
storeA.foo = "bar";

// Print the contents of storeB
console.log(storeB) // => { foo: "bar" }
```

## Caveats

 1. Yjs Text shared types are not supported. In the future, any string you put
    in a YJSON object will be transformed into Yjs Text instances.
 1. YJSON objects currently provide no system for subscribing or observing
    updates. This will be implemented in the future to allow for interaction
    with functional reactive systems like React.

---

## License

This library is licensed under the MIT License.

> Copyright (c) 2021 Joseph R Miles <joe@jrm.dev>
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.