const Y = require("yjs");

const yjson = (doc) =>
{
  const storage = doc.getMap('storage');
  const store = storage.toJSON();

  return new Proxy(
    store,
    {
      get: (object, property) =>
      {
        const value = storage.get(property)

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
          storage.set(property, yvalue);
        }
        else if (value instanceof Object)
        {
          const yvalue = new Y.Map();
          storage.set(property, yvalue);
        }
        else {
          storage.set(property, value);
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