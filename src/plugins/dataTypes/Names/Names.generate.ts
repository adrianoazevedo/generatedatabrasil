import { DataTypeGenerateType } from '../../../../types/general';
import { getRandomArrayValue, getRandomBool, getRandomCharInString } from '../../../utils/utils';
import { getUnique } from '../../../utils/arrayUtils';
import { maleNames, femaleNames, lastNames } from './Names.data';
import { NamesState } from './Names.ui';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const genders = ['male', 'female'];

export const getGenerationSettings = (state: NamesState) => state.options;

const getRandomGender = () => getRandomBool() ? genders[0] : genders[1];


export const generate = (data: DataTypeGenerateType) => {
    const placeholderStr = data.generationSettings;

    // in case the user entered multiple | separated formats, pick one first
    const formats = placeholderStr.split('|');
    let chosenFormat = formats[0];
    if (formats.length > 1) {
        chosenFormat = getRandomArrayValue(formats);
    }

    // the placeholder string with all the placeholders removed
    let output = chosenFormat;

    // the user can enter any old thing in the place holder field. We do our best to return some "gender" metadata
    // based on what we find. In case we find multiple genders, we return "unknown"
    let foundGenders = [];

    while (/MaleName/.test(output)) {
        foundGenders.push('male');
        output = output.replace(/MaleName/, getRandomArrayValue(maleNames));
    }

    while (/FemaleName/.test(output)) {
        foundGenders.push('female');
        output = output.replace(/FemaleName/, getRandomArrayValue(maleNames));
    }

    while (/Name/.test(output)) {
        const gender = getRandomGender();
        foundGenders.push(gender);
        const source = (gender === 'male') ? maleNames : femaleNames;
        output = output.replace(/Name/, getRandomArrayValue(source));
    }

    while (/Surname/.test(output)) {
        output = output.replace(/Surname/, getRandomArrayValue(lastNames));
    }
    while (/Initial/.test(output)) {
        output = output.replace(/Initial/, getRandomCharInString(letters));
    }

    let gender = 'unknown';
    if (foundGenders.length === 1) {
        gender = foundGenders[0];
    } else if (foundGenders.length > 1) {
        const uniques = getUnique(foundGenders);
        if (uniques.length === 1) {
            gender = uniques[0];
        }
    }

    return {
        display: output.trim(),
        gender
    };
};

export const getMetadata = () => ({
    SQLField: 'varchar(255) default NULL',
    SQLField_Oracle: 'varchar2(255) default NULL',
    SQLField_MSSQL: 'VARCHAR(255) NULL'
});
