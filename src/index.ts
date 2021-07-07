import Y from "yjs";
import { v4 as uuid } from "uuid";

const createYMapFromObject = <T = any>(object: any): Y.Map<T> =>
{
  const ymap = new Y.Map<T>();

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

const createObjectFromYMap = <T = {}>(ymap: Y.Map<any>): T =>
{
  const object: T = {} as T;

  for (const [ key, value ] of ymap)
  {
    if (value instanceof Y.Array)
      (object as any)[key] = createArrayFromYArray(value);

    else if (value instanceof Y.Map)
      (object as any)[key] = createObjectFromYMap(value)

    else
      (object as any)[key] = value;
  }

  return createObjectProxyForMap(ymap, object);
};

const createYArrayFromArray = <T = any>(array: T[]): Y.Array<T> =>
{
  const yarray = new Y.Array<T>();

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

const createArrayFromYArray = <T = any>(yarray: Y.Array<T>): T[] =>
{
  return new Proxy(
    yarray.toJSON(),
    {
      get: (object, property, receiver) =>
      {
        if (Object.keys(object).includes(property as string))
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
        if (Object.keys(object).includes(property as string))
        {
          object[property] = value;

          const index = parseInt(property as string, 10);

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

const createObjectProxyForMap = <T = {}>(
  map: Y.Map<any>,
  object: T = ({} as T)
): T =>
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
            (object as any)[key] = map.get(key);
            break;

          case 'delete':
            delete (object as any)[key];
            break;
        }
      });
    }
  });

  return <T><unknown>(
    new Proxy(
      (<unknown>object) as object,
      {
        get: (_, property) =>
        {
          const value = map.get(property as string)

          if (value instanceof Y.Array)
            return createArrayFromYArray(value);

          else if (value instanceof Y.Map)
            return createObjectFromYMap(value);

          else
            return value;
        },
        set: (object: any, property, value) =>
        {
          object[property] = value;

          if (value instanceof Array)
            map.set(property as string, createYArrayFromArray(value));

          else if (value instanceof Object)
            map.set(property as string, createYMapFromObject(value));

          else
            map.set(property as string, value);

          return true;
        },
      }
    )
  );
};

interface IYjson
{
  observe(callback: (event: Y.YEvent, transaction: Y.Transaction) => void): void;
}

export type Yjson<T> = IYjson & T;

export const yjson =
  <T = { [index: string]: any }>(
    doc: Y.Doc,
    name: string = uuid()
  ): Yjson<T> =>
  {
    const map = doc.getMap(name);

    const store = createObjectProxyForMap<T>(map);

    return {
      ...store,
      observe: (callback) => map.observe(callback)
    };
  };

export default yjson;