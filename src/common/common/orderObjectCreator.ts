export function orderObjectCreator(obj: object): any {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      if (typeof obj[key] === 'object') {
        acc[key] = obj[key].toString();
      } else {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
}
