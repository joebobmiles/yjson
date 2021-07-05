const Y = require("yjs");

const yjson = (doc) =>
{
  const __storageA = doc.getMap('storage');
  const __storeA = __storageA.toJSON();

  return new Proxy(
    __storeA,
    {
      get: (object, property) =>
      {
        const value = __storageA.get(property)

        if (value instanceof Y.Array || value instanceof Y.Map)
        {
          return value.toJSON();
        }
        else {
          return value;
        }
      },
      set: (object, property, value) =>
      {
        object[property] = value;

        if (value instanceof Array)
        {
          const yvalue = Y.Array.from(value);
          __storageA.set(property, yvalue);
        }
        else if (value instanceof Object)
        {
          const yvalue = new Y.Map();
          __storageA.set(property, yvalue);
        }
        else {
          __storageA.set(property, value);
        }

        return true;
      }
    }
  );
};

module.exports =
{
  yjson,
};