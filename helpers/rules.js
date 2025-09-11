export const rules = {
    invalidPhoneMessage: 'Enter a valid telephone number, it should not include spaces, dashes or brackets.',
    patternHttpsUrl: /^(https:\/\/)[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,9}(:[0-9]{1,5})?(\/.*)?$/,
    patternEmail: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    patternNumberMin5Max15: /^\d{5,15}$/,
    patternPhone: /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/, // https://www.regexpal.com/94779
    patternWhiteSpace: /\s/,
    rules: {
        counter100: value => (!value || value.length <= 100) || 'Max 100 characters',
        counter150: value => (!value || value.length <= 150) || 'Max 150 characters',
        counter250: value => (!value || value.length <= 250) || 'Max 250 characters',
        counter500: value => (!value || value.length <= 500) || 'Max 500 characters',
        counter1000: value => (!value || value.length <= 1000) || 'Max 1000 characters',
        counter1500: value => (!value || value.length <= 1500) || 'Max 1500 characters',
        counter2000: value => (!value || value.length <= 2000) || 'Max 2000 characters',
        counter2500: value => (!value || value.length <= 2500) || 'Max 2500 characters',
        counter3000: value => (!value || value.length <= 3000) || 'Max 3000 characters',
        counter4000: value => (!value || value.length <= 4000) || 'Max 4000 characters',
        counter10000: value => (!value || value.length <= 10000) || 'Max 10000 characters',
        value0to100: value => (value >= 0 && value <= 100) || 'Value needs to be between 0 and 100',
        email: (value) => {
            return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value) || 'Enter a valid email address.'
        },
        phoneNumber: value => {
        if (!this.required && value && value.length > 0) {
            return this.patternNumberMin5Max15.test(value) || this.invalidPhoneMessage
        } else if (this.required && this.countryCode && this.countryCode === '+44') {
            return this.patternPhone.test(value) || this.invalidPhoneMessage
        } else {
            return true
        }
        },
        httpsUrl: value => {
        if (!this.required && value && value.length < 1) {
            return true
        } else {
            return this.patternHttpsUrl.test(value) || 'Enter a valid Https URL.'
        }
        },
        noWhiteSpace: value => {
        return !this.patternWhiteSpace.test(value) || 'Spaces not allowed'
        },
        required: value => !!value || 'This field is required.',
        requiredNotNull: value => (value !== null && value !== undefined) || 'This field is required.'
    }
}