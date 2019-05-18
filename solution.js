
export function add(...numsToAdd) {
    return numsToAdd.reduce((orginal, toAdd) => orginal + toAdd);
}
