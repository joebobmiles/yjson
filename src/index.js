const Y = require("yjs");

const createYMapFromObject = (object) =>
{
  const ymap = new Y.Map();

  for (let property in object)
  {
    if (object[property] instanceof Object)
      ymap.set(property, createYMapFromObject(object[property]));

    else
      ymap.set(property, object[property]);
  }

  return ymap;
};

const createObjectFromYMap = (map) =>
{
  const object = {};

  for (const [ key, value ] of map)
  {
    if (value instanceof Y.Map)
      object[key] = createObjectFromYMap(value)

    else
      object[key] = value;
  }

  return createObjectProxyForMap(map, object);
};

const createArrayFromYArray = (array) =>
{
  return new Proxy(
    array.toJSON(),
    {
      get: (object, property, receiver) =>
      {
        if (Object.keys(object).includes(property))
        {
          const value = array.get(parseInt(property.toString(), 10));

          if (value instanceof Y.Array)
            return createArrayFromYArray(value);

          else if (value instanceof Y.Map)
            return createObjectFromYMap(value);

          else
            return value;
        }
        else
          return Reflect.get(object, property, receiver)
      },
      set: (object, property, value, receiver) =>
      {
        if (Object.keys(object).includes(property))
        {
          object[property] = value;

          const index = parseInt(property, 10);

          const left = array.slice(0, index);
          const right = array.slice(index+1);
          
          array.delete(0, array.length);

          if (value instanceof Array)
            array.insert(0,[ ...left, Y.Array.from(value), ...right ]);

          else if (value instanceof Object)
            array.insert(0, [ ...left, createYMapFromObject(value), ...right ]);

          else
            array.insert(0, [ ...left, value, ...right ]);
        }
        else
          Reflect.set(object, property, value, receiver)

        return true;
      }
    }
  )
};

const createObjectProxyForMap = (map, object = {}) =>
{
  Object.entries(object).forEach(([ property, value ]) =>
  {
    if (value instanceof Object)
      map.set(property, createYMapFromObject(value));

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
          return createArrayFromYArray(value);

        else if (value instanceof Y.Map)
          return createObjectFromYMap(value);

        else
          return value;
      },
      set: (object, property, value) =>
      {
        object[property] = value;

        if (value instanceof Array)
          map.set(property, Y.Array.from(value));

        else if (value instanceof Object)
          map.set(property, createYMapFromObject(value));

        else
          map.set(property, value);

        return true;
      },
    }
  );
};

const yjson = (doc) => createObjectProxyForMap(doc.getMap('storage'));

module.exports =
{
  yjson,
};