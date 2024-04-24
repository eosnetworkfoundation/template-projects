export const humanReadableNumber = (num: number) => {
    const toFixedIfNotZero = (num: number) => {
        if(num % 1 === 0) {
            return num.toFixed(0);
        }
        return num.toFixed(2);
    }

    if(num >= 1000000000000) {
        return toFixedIfNotZero(num / 1000000000000) + 'T';
    }

    if(num >= 1000000000) {
        return toFixedIfNotZero(num / 1000000000) + 'B';
    }

    if(num >= 1000000) {
        return toFixedIfNotZero(num / 1000000) + 'M';
    }

    if(num >= 1000) {
        return toFixedIfNotZero(num / 1000) + 'K';
    }

    return toFixedIfNotZero(num);
}
