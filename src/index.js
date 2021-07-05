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
      object[key] = createObjectFromMap(value)

    else
      object[key] = value;
  }

  return createObjectProxyForMap(map, object);
};

const createObjectProxyForMap = (map, object = {}) =>
{
  Object.entries(object).forEach(([ property, value ]) =>
  {
    if (value instanceof Object)
      map.set(property, createMapFromObject(value));

    else
      map.set(property, value)
  });

  return new Proxy(
    object,
    {
      get: (_, property) =>
      {
        const value = map.get(property)

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
          map.set(property, yvalue);
        }
        else if (value instanceof Object)
        {
          map.set(property, createMapFromObject(value));
        }
        else {
          map.set(property, value);
        }

        return true;
      }
    }
  );
};

const yjson = (doc) => createObjectProxyForMap(doc.getMap('storage'));

module.exports =
{
  yjson,
};