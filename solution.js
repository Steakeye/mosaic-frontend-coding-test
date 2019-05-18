
export function add(...numsToAdd) {
    return numsToAdd.reduce((orginal, toAdd) => orginal + toAdd);
}

function safelyAddDeepValue(objectToAugment, keyPath, value) {
    let currentContext = objectToAugment;
    keyPath.forEach((key, idx)=> {
        let nextContext = currentContext[key];

        if (!nextContext) {
            const nextKey = keyPath[idx+1];

            if (nextKey !== undefined) {
                const nextObjectShouldBeArray = typeof nextKey === 'number';
                nextContext = currentContext[key] = nextObjectShouldBeArray ? [] : {}
            } else {
                currentContext[key] = value;
            }
        }
        currentContext = nextContext
    })
}

export function deserialize(dataToRestructure) {
    const keyPattern = /(\w+)(\d)_(\w+)/;

    const restucturesdData = {};

    Object.entries(dataToRestructure).forEach(([key, value]) => {
        //console.log('log', ...arguments)
        //console.log('keyPattern', keyPattern);
        //console.log('key', key);
        //console.log('key, value', key, value)
        const keyMatchesPattern = key.match(keyPattern);

        if (keyMatchesPattern) {
            const keysToCreate = keyMatchesPattern.slice(1);

            keysToCreate[1] = parseInt(keysToCreate[1]);

            //console.log('keysToCreate', keysToCreate);
            //restucturesdData[]
            //console.log('typeof keysToCreate[1]', typeof keysToCreate[1], keysToCreate[1])
            safelyAddDeepValue(restucturesdData, keysToCreate, value)

        } else {
            restucturesdData[key] = value;
        }
    })

    return restucturesdData;
}