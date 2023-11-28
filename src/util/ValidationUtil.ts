export class ValidationUtil {
    static validate(fieldName: string, fieldValue: string | undefined, minLength: number, maxLength: number): string | undefined {
        if (fieldValue != undefined) {
            if (fieldValue.length < minLength) {
                return `${fieldName} must be at least ${minLength} characters long`;
            }
            if (fieldValue.length > maxLength) {
                return `${fieldName} must be less than ${maxLength} characters long`;
            }
        }
        return undefined;
    }

    static validateRequire(fieldName: string, fieldValue: string | undefined, minLength: number, maxLength: number): string | undefined {
        if(fieldValue == undefined) {
            return `${fieldName} is required`
        }
        return this.validate(fieldName, fieldValue, minLength, maxLength);
    }

    static validateNumber(fieldName: string, fieldValue: number | undefined, minLength: number, maxLength: number): string | undefined {
        if (fieldValue != undefined) {
            if (fieldValue < minLength) {
                return `${fieldName} must be greater than ${minLength}`;
            }
            if (fieldValue > maxLength) {
                return `${fieldName} must be less than ${maxLength}`;
            }
        }
        return undefined;
    }
    
    static validateNumberRequire(fieldName: string, fieldValue: number | undefined, minLength: number, maxLength: number): string | undefined {
        if(fieldValue == undefined) {
            return `${fieldName} is required`
        }
        return this.validateNumber(fieldName, fieldValue, minLength, maxLength);
    }
}