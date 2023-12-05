class DataUtilClass {
    isArray(val: any) {
        return Array.isArray(val);
    }
    isObject(val: any) {
        return typeof val === 'object' && val !== null;
    }

    deepCopy(obj2: any) {
        var obj: any = this.isArray(obj2) ? [] : {};
        for (var property in obj2) {
            if (this.isObject(obj2[property])) {
                obj[property] = this.deepCopy(obj2[property]);
            } else {
                obj[property] = obj2[property];
            }
        }
        return obj;
    }

    validateEmail(email: string) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    jsonToMarkdown(json: any, indentation = '  '): string {
        if (typeof json !== 'object') return json;
        let markdown = '';
        for (const [key, value] of Object.entries(json)) {
            if (Array.isArray(value)) {
                markdown += `${indentation}**${key}**: \n\n`;
                for (let i = 0; i < value.length; i++) {
                    const index = i + 1;
                    markdown += `${indentation}  ${index}: ${value[i]}\n\n`;
                }
            } else if (typeof value === 'object') {
                markdown += `${indentation}**${key}**: \n\n`;
                markdown += this.jsonToMarkdown(value, `${indentation}  `) + '\n\n';
            } else {
                const index = parseInt(key);
                if (Array.isArray(json) && Number.isInteger(index)) {
                    markdown += `${indentation}  ${index + 1} : ${value}\n\n`;
                } else {
                    markdown += `${indentation}  ${key} : ${value}\n\n`;
                }
            }
        }

        return markdown;
    }

    compareObject(v1: any, v2: any) {
        if (v1 === null && v2 === null) return true;
        if ((v1 === null && v2 !== null) || (v1 !== null && v2 === null)) return false;
        if (this.isObject(v1) !== this.isObject(v2)) return false;
        if (Object.keys(v1).length !== Object.keys(v2).length) return false;
        for (let k1 in v1) {
            if (v1[k1] !== v2[k1]) return false;
        }
        return true;
    }

    matchObject(data: any, filter: any) {
        if (!this.isObject(data) || !this.isObject(filter)) return false;
        let isMatch = true;
        for (let k in filter) {
            if (filter[k] !== data[k]) {
                isMatch = false;
                break;
            }
        }

        return isMatch;
    }

    matchArray(data: any[], filter: any[]) {
        for (let fi of filter) {
            if (!data.includes(fi)) return false;
        }
        return true;
    }

    filterFromArray(data: any[], filter: any) {
        if (this.isArray(filter)) {
            return data.filter((item: any) => {
                for (let fi of filter) {
                    if (this.matchObject(item, fi)) return true;
                }
                return false;
            });
        } else if (this.isObject(filter)) {
            return data.filter((item: any) => {
                return this.matchObject(item, filter);
            });
        }

        return [];
    }

    findFromArray(data: any[], filter: any) {
        const res: any[] = this.filterFromArray(data, filter);
        if (res && res.length) return res[0];
        return null;
    }

    filterFromObject(data: any, filter: string[]) {
        if (!this.isObject(data) || !filter.length) return data;
        const res: any = {};
        const keys = Object.keys(data);
        for (let k of filter) {
            if (keys.includes(k)) res[k] = data[k];
            else return null;
        }
        return res;
    }

    formFromArray(source: any[], filterData: any, filterKeys: string[]) {
        let res: any[] = [];
        if (this.isArray(filterData)) {
            for (let item of filterData) {
                const data = this.formFromArray(source, item, filterKeys);
                res.push(...data);
            }
        } else if (this.isObject(filterData)) {
            let isFound = false;
            for (let data of source) {
                let isMatch = true;
                for (let k in filterData) {
                    if (filterKeys.includes(k) && filterData[k] !== data[k]) {
                        isMatch = false;
                        break;
                    }
                }
                if (isMatch) {
                    isFound = true;
                    res.push({ ...data, ...filterData });
                }
            }
            if (!isFound) {
                res.push({ ...filterData });
            }
        }
        return res;
    }

    removeOneFromArray(data: any[], filter: any) {
        if (!this.isArray(data) || filter === undefined) return data;
        const count = data.length;
        for (let i = 0; i < count; i++) {
            if (this.isObject(data[i]) && this.isObject(filter)) {
                if (this.matchObject(data[i], filter)) {
                    data.splice(i, 1);
                }
            } else {
                if (data[i] === filter) {
                    data.splice(i, 1);
                }
            }
        }
        return data;
    }

    filterObjectByArray(data: any, filter: string[]) {
        if (!this.isObject(data) || !filter.length) return data;
        const keys = Object.keys(data);
        // console.debug('filterObjectByArray, filter:', filter);
        for (let k of keys) {
            if (!filter.includes(k)) {
                console.debug('not found k:', k);
                delete data[k];
            }
        }
        // console.debug('filterObjectByArray data:', data);
        return data;
    }

    filterObjectByObject(data: any, filter: any) {
        if (!this.isObject(data) || !this.isObject(filter)) return data;
        return this.filterObjectByArray(data, Object.keys(filter));
    }

    filterObject(data: any, filter: any) {
        if (!this.isObject(data)) return data;
        if (this.isArray(filter)) return this.filterObjectByArray(data, filter);
        else if (this.isObject(filter)) return this.filterObjectByObject(data, filter);
        else return data;
    }
}

const DataUtil = new DataUtilClass();

export default DataUtil;
