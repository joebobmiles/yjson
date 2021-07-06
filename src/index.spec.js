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
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = 3;

    expect(objectA).toEqual({ test: 3 });
    expect(objectB).toEqual({ test: 3 });
  });

  it("Creates stores that share arrays.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = [ "hello", "world" ];

    expect(objectA).toEqual({ test: [ "hello", "world" ] });
    expect(objectB).toEqual({ test: [ "hello", "world" ] });

    objectA.test[0] = "goodbye";

    expect(objectA).toEqual({ test: [ "goodbye", "world" ] });
    expect(objectB).toEqual({ test: [ "goodbye", "world" ] });
  });

  it("Creates stores that share nested arrays.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = [ "hello", [ "world", "universe" ] ];

    expect(objectA).toEqual({ test: [ "hello", [ "world", "universe" ] ] });
    expect(objectB).toEqual({ test: [ "hello", [ "world", "universe" ] ] });

    objectA.test[1][1] = "cosmos";

    expect(objectA).toEqual({ test: [ "hello", [ "world", "cosmos" ] ] });
    expect(objectB).toEqual({ test: [ "hello", [ "world", "cosmos" ] ] });
  });

  it("Creates stores that share objects nested in arrays.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = [ { foo: 1 }, { bar: 2 } ];

    expect(objectA).toEqual({ test: [ { foo: 1 }, { bar: 2 } ] });
    expect(objectB).toEqual({ test: [ { foo: 1 }, { bar: 2 } ] });

    objectA.test[0].foo = 3;

    expect(objectA).toEqual({ test: [ { foo: 3 }, { bar: 2 } ] });
    expect(objectB).toEqual({ test: [ { foo: 3 }, { bar: 2 } ] });
  });

  it("Creates stores that share objects.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = { "hello": "world" };

    expect(objectA).toEqual({ test: { "hello": "world" } });
    expect(objectB).toEqual({ test: { "hello": "world" } });

    objectA.test.hello = "samwise";

    expect(objectA).toEqual({ test: { "hello": "samwise" } });
    expect(objectB).toEqual({ test: { "hello": "samwise" } });
  });

  it("Creates stores that share nested objects.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = { foo: { bar: 'baz' } };

    expect(objectA).toEqual({ test: { foo: { bar: 'baz' } } });
    expect(objectB).toEqual({ test: { foo: { bar: 'baz' } } });

    objectA.test.foo.bar = 3;

    expect(objectA).toEqual({ test: { foo: { bar: 3 } } });
    expect(objectB).toEqual({ test: { foo: { bar: 3 } } });
  });

  it("Creates stores that share arrays nested in objects.", () =>
  {
    const objectA = yjson(doc1, "storage");
    const objectB = yjson(doc2, "storage");

    objectA.test = { foo: [ 'bar', 'baz' ] };

    expect(objectA).toEqual({ test: { foo: [ 'bar', 'baz' ] } });
    expect(objectB).toEqual({ test: { foo: [ 'bar', 'baz' ] } });

    objectA.test.foo[0] = 3;

    expect(objectA).toEqual({ test: { foo: [ 3, 'baz' ] } });
    expect(objectB).toEqual({ test: { foo: [ 3, 'baz' ] } });
  });

  it("Creates stores that do not sync by default.", () =>
  {
    const objectA = yjson(doc1);
    const objectB = yjson(doc2);

    objectA.test = { foo: [ 'bar', 'baz' ] };

    expect(objectA).toEqual({ test: { foo: [ 'bar', 'baz' ] } });
    expect(objectB).toEqual({});
  });

  it("Does not populate a new store after the first has been modified.", () =>
  {
    const objectA = yjson(doc1, "storage");

    objectA.test = 12;

    const objectB = yjson(doc2, "storage");

    expect(objectA).toEqual({ test: 12 });
    expect(objectB).toEqual({});

    objectA.test = "foo";

    expect(objectA).toEqual({ test: "foo" });
    expect(objectB).toEqual({ test: "foo" });
  });
});