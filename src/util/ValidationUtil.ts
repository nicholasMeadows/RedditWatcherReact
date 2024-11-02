export class ValidationUtil {
  static validate(
    fieldName: string,
    fieldValue: string | undefined,
    minLength: number,
    maxLength: number
  ): string | undefined {
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

  static validateRequire(
    fieldName: string,
    fieldValue: string | undefined,
    minLength: number,
    maxLength: number
  ): string | undefined {
    if (fieldValue == undefined) {
      return `${fieldName} is required`;
    }
    return this.validate(fieldName, fieldValue, minLength, maxLength);
  }

  static validateNumber(
    fieldName: string,
    fieldValue: number | undefined,
    minLength: number,
    maxLength: number
  ): string | undefined {
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

  static validateNumberRequire(
    fieldName: string,
    fieldValue: number | undefined,
    minLength: number,
    maxLength: number
  ): string | undefined {
    if (fieldValue == undefined) {
      return `${fieldName} is required`;
    }
    return this.validateNumber(fieldName, fieldValue, minLength, maxLength);
  }

  static validateIpAddressWithPortAndHttp(
    fieldName: string,
    fieldValue: string | undefined
  ): string | undefined {
    const regex = new RegExp(
      "^(http|https):\\/\\/((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}:[0-9]{1,4}$"
    );
    if (fieldValue === undefined || fieldValue.match(regex)) {
      return undefined;
    } else {
      const formatString = "http://<IP-Address>:<Port>";
      return `${fieldName} invalid. Url must follow following format: ${formatString}`;
    }
  }
}
