export function firstUpper(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function controllerName(str: string): string {
    str = firstUpper(str)
    let done = false
    while (!done) {
        let pos = str.indexOf('-')
        if (pos === -1) {
            done = true
        } else {
            str = str.substring(0, pos) + firstUpper(str.substring(pos + 1))
        }
    }
    return str
}

export function fileName(str: string): string {
    let done = false
    while (!done) {
        let pos = -1
        for (var n = 0; n < str.length; n++) {
            if ("QWERTYUIOPLKJHGFDSAZXCVBNM".indexOf(str[n]) !== -1) {
                pos = n
                break;
            }
        }
        if (pos === -1) {
            done = true
        } else {
            if (pos == 0) {
                str = str[0].toLowerCase() + str.substring(1)
            } else {
                str = str.substring(0, pos) + '.' + str[pos].toLowerCase() + str.substring(pos + 1)
            }
        }
    }
    return str.toLowerCase().replace('-', '.');
}