const Y = require("yjs");
const { v4: uuid } = require("uuid");

const createYMapFromObject = (object) =>
{
  const ymap = new Y.Map();

  for (let property in object)
  {
    if (object[property] instanceof Array)
      ymap.set(property, createYArrayFromArray(object[property]));

    else if (object[property] instanceof Object)
      ymap.set(property, createYMapFromObject(object[property]));

    else
      ymap.set(property, object[property]);
  }

  return ymap;
};

const createObjectFromYMap = (ymap) =>
{
  const object = {};

  for (const [ key, value ] of ymap)
  {
    if (value instanceof Y.Array)
      object[key] = createArrayFromYArray(value);

    else if (value instanceof Y.Map)
      object[key] = createObjectFromYMap(value)

    else
      object[key] = value;
  }

  return createObjectProxyForMap(ymap, object);
};

const createYArrayFromArray = (array) =>
{
  const yarray = new Y.Array();

  for (let index in array)
  {
    if (array[index] instanceof Array)
      yarray.push([ createYArrayFromArray(array[index]) ]);

    else if (array[index] instanceof Object)
      yarray.push([ createYMapFromObject(array[index]) ]);

    else
      yarray.push([ array[index] ]);
  }

  return yarray;
};

const createArrayFromYArray = (yarray) =>
{
  return new Proxy(
    yarray.toJSON(),
    {
      get: (object, property, receiver) =>
      {
        if (Object.keys(object).includes(property))
        {
          const value = yarray.get(parseInt(property.toString(), 10));

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

          const left = yarray.slice(0, index);
          const right = yarray.slice(index+1);
          
          yarray.delete(0, yarray.length);

          if (value instanceof Array)
            yarray.insert(0,[ ...left, createYArrayFromArray(value), ...right ]);

          else if (value instanceof Object)
            yarray.insert(0, [ ...left, createYMapFromObject(value), ...right ]);

          else
            yarray.insert(0, [ ...left, value, ...right ]);
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
    if (value instanceof Array)
      map.set(property, createYArrayFromArray(value));

    else if (value instanceof Object)
      map.set(property, createYMapFromObject(value));

    else
      map.set(property, value)
  });

  map.observe(({ target, changes }) =>
  {
    if (target === map)
    {
      changes.keys.forEach((change, key) =>
      {
        switch (change.action)
        {
          case 'add':
          case 'update':
            object[key] = map.get(key);
            break;

          case 'delete':
            delete object[key];
            break;
        }
      });
    }
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
          map.set(property, createYArrayFromArray(value));

        else if (value instanceof Object)
          map.set(property, createYMapFromObject(value));

        else
          map.set(property, value);

        return true;
      },
    }
  );
};

const yjson = (doc, name = uuid()) =>
{
  const store = createObjectProxyForMap(doc.getMap(name));
  return store;
};

module.exports =
{
  yjson,
  default: yjson,
};