const Y = require("yjs");
const yjson = require(".").default;

describe("yjson", () =>
{
  let doc1;
  let doc2;

  beforeEach(() =>
  {
    doc1 = new Y.Doc();
    doc2 = new Y.Doc();

    doc1.on("update", (update) =>
    {
      Y.applyUpdate(doc2, update);
    });
    doc2.on("update", (update) =>
    {
      Y.applyUpdate(doc1, update);
    });
  });

  it("Creates stores that share scalar values.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = 3;

    expect(objectA.test).toEqual(3);
    expect(objectB.test).toEqual(3);
  });

  it("Creates stores that share arrays.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = [ "hello", "world" ];

    expect(objectA.test).toEqual([ "hello", "world" ]);
    expect(objectB.test).toEqual([ "hello", "world" ]);

    objectA.test[0] = "goodbye";

    expect(objectA.test).toEqual([ "goodbye", "world" ]);
    expect(objectB.test).toEqual([ "goodbye", "world" ]);
  });

  it("Creates stores that share nested arrays.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = [ "hello", [ "world", "universe" ] ];

    expect(objectA.test).toEqual([ "hello", [ "world", "universe" ] ]);
    expect(objectB.test).toEqual([ "hello", [ "world", "universe" ] ]);

    objectA.test[0][1] = "cosmos";

    expect(objectA.test).toEqual([ "hello", [ "world", "cosmos" ] ]);
    expect(objectB.test).toEqual([ "hello", [ "world", "cosmos" ] ]);
  });

  it("Creates stores that share objects.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = { "hello": "world" };

    expect(objectA.test).toEqual({ "hello": "world" });
    expect(objectB.test).toEqual({ "hello": "world" });

    objectA.test.hello = "samwise";

    expect(objectA.test).toEqual({ "hello": "samwise" });
    expect(objectB.test).toEqual({ "hello": "samwise" });
  });

  it("Creates stores that share nested objects.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = { foo: { bar: 'baz' } };

    expect(objectA.test).toEqual({ foo: { bar: 'baz' } });
    expect(objectB.test).toEqual({ foo: { bar: 'baz' } });

    objectA.test.foo.bar = 3;

    expect(objectA.test.foo.bar).toEqual(3);
    expect(objectB.test.foo.bar).toEqual(3);
  });
});