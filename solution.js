
function tcoTrampoline(fn) {
    return function(...args) {
        let res = fn(...args);

        while (res && typeof res === 'function') {
            res = res();
        }

        return res;
    };
}

export function add(...numsToAdd) {
    return numsToAdd.reduce((orginal, toAdd) => orginal + toAdd);
}

const safelyAddDeepValue = tcoTrampoline(addDeepValue);

function addDeepValue(objectToAugment, keyPath, value) {
    let currentContext = objectToAugment;

    const nestedValues = [];

    keyPath.forEach((key, idx)=> {
        let nextContext = currentContext[key];

        if (!nextContext) {
            const nextKey = keyPath[idx+1];

            if (nextKey !== undefined) {
                const nextObjectShouldBeArray = typeof nextKey === 'number';
                nextContext = currentContext[key] = nextObjectShouldBeArray ? [] : {}
            } else {
                console.log('values assigning', value)
                if ((value instanceof Object) && !(value instanceof Array)) {
                    const deferredContext = currentContext;
                    console.log('nested values push', value)
                    nestedValues.push(() => {
                        deferredContext[key] = deserialize(value)
                    })
                } else {
                    currentContext[key] = value;
                }
            }
        }
        currentContext = nextContext
    });

    if (nestedValues.length) {
        return () => nestedValues.forEach(f => f())
    } else {
        return  objectToAugment;
    }
}

export function deserialize(dataToRestructure) {
    const keyPattern = /(\w+)(\d)_(\w+)/;

    const restucturesdData = {};

    Object.entries(dataToRestructure).forEach(([key, value]) => {
        const keyMatchesPattern = key.match(keyPattern);

        if (keyMatchesPattern) {
            const keysToCreate = keyMatchesPattern.slice(1);

            keysToCreate[1] = parseInt(keysToCreate[1]);

            safelyAddDeepValue(restucturesdData, keysToCreate, value)

        } else {
            restucturesdData[key] = value;
        }
    });

    return restucturesdData;
}