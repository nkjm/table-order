"use strict";

module.exports = (record_list, lang) => {
    const translated_record_list = JSON.parse(JSON.stringify(record_list));

    let i = 0;
    for (let record of record_list){
        if (record.label[lang]){
            translated_record_list[i].label = record.label[lang];
        } else {
            translated_record_list[i].label = record.label[Object.keys(record.label)[0]];
        }
        i++;
    }

    return translated_record_list;
}