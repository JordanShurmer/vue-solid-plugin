import solidData from '@solid/query-ldflex';

class TypeIndex {

  constructor(srcData = solidData.user) {
    if (typeof srcData === 'string') {
      srcData = solidData[srcData];
    }
    this.srcData = srcData;
  }

  async location(desiredClass) {
    console.debug(`Checking typeIndex ${await this.srcData.publicTypeIndex} for class ${desiredClass}`);
    const typeIndexes = (await solidData[await this.srcData.publicTypeIndex]).subjects;

    for await (const typeIndex of typeIndexes) {
      const forClass = await solidData[typeIndex]['solid:forClass'];
      if (forClass && forClass.toString() === desiredClass) {
        const location = await solidData[typeIndex]['solid:instance'];
        console.info(`Type Index for class ${desiredClass} found: ${location}`);
        return location.toString();
      }
    }
  }

  async instances(desiredClass) {
    const instances = [];
    const location = await this.location(desiredClass);
    if (location) {
      for await (let loc of solidData[location].subjects) {
        console.log(`loc: ${loc}`);
        instances.push(loc);
      }
    } else {
      console.debug(`No location found for ${desiredClass}`);
    }

    return instances;
  }
}

export default TypeIndex;
