
export function add(...numsToAdd) {
    return numsToAdd.reduce((original, toAdd) => original + toAdd);
}

export function deserialize(dataToRestructure) {
    const keyPattern = /(\w+)(\d)_(\w+)/;

    const restucturesdData = {};

    Object.entries(dataToRestructure).forEach(([key, value]) => {
        const keyMatchesPattern = key.match(keyPattern);
        const parsedValue = parseValue(value);

        if (keyMatchesPattern) {
            const keysToCreate = keyMatchesPattern.slice(1);

            keysToCreate[1] = parseInt(keysToCreate[1]);

            safelyAddDeepValue(restucturesdData, keysToCreate, parsedValue, deserialize)

        } else {
            restucturesdData[key] = parsedValue;
        }
    });

    return restucturesdData;
}

export function listToObject(listToconvert) {
    const obj = listToconvert.reduce((original, { name, value }) => {
        original[name] = cloneValue(value);
        return original;
    }, {});

    return obj;
}

export function objectToList(objForConversion) {
    return Object.entries(objForConversion).map(([key, value]) => {
        return { name: key, value: cloneValue(value) };
    });
}

function cloneValue(value) {
    let clonedValue;

    switch (true) {
        case value instanceof Array: {
            clonedValue = value.slice();
            break;
        }
        case value instanceof Object: {
            clonedValue = Object.assign({}, value);
            break;
        }
        default:
            clonedValue = value;
    }

    return clonedValue;
}

const safelyAddDeepValue = tcoTrampoline(addDeepValue);

function addDeepValue(objectToAugment, keyPath, value, moreWorkFunc) {
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
                if ((value instanceof Object) && !(value instanceof Array)) {
                    const deferredContext = currentContext;
                    nestedValues.push(() => {
                        deferredContext[key] = moreWorkFunc(value)
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

function parseTime(timeToParse) {
    const parsedDate = new Date(timeToParse);

    const formatDateNum = (date) => (date < 10 ? '0': '') + date;

    return `${formatDateNum(parsedDate.getUTCDate())}/${formatDateNum(parsedDate.getMonth() + 1)}/${parsedDate.getUTCFullYear()}`
}

function parseValue(valueToParse) {
    let parsedVal = valueToParse;

    if (typeof valueToParse  === 'string') {
        const timePattern = /t:(\d+)/;

        const timeMatch = valueToParse.match(timePattern);

        if (timeMatch) {
            parsedVal = parseTime(parseInt(timeMatch[1]));
        }

    }

    return parsedVal;
}

function tcoTrampoline(fn) {
    return function(...args) {
        let res = fn(...args);

        while (res && typeof res === 'function') {
            res = res();
        }

        return res;
    };
}
