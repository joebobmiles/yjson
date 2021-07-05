const Y = require("yjs");

const createMapFromObject = (object) =>
{
  const ymap = new Y.Map();

  for (let property in object)
  {
    if (object[property] instanceof Object)
      ymap.set(property, createMapFromObject(object[property]));

    else
      ymap.set(property, object[property]);
  }

  return ymap;
};

const createObjectFromMap = (map) =>
{
  const object = {};

  for (const [ key, value ] of map)
  {
    if (value instanceof Y.Map)
      object[key] = createObjectFromMap(value);

    else
      object[key] = value;
  }

  return object;
};

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

        if (value instanceof Y.Array)
        {
          return value.toJSON();
        }
        else if (value instanceof Y.Map)
        {
          return createObjectFromMap(value);
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
          storage.set(property, createMapFromObject(value));
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