export default class StringUtil {
    static format(input: string, ...args: any[]): string {
        let workingStr = input;
        let argIndex = 0;

        while (input.indexOf("{?}") !== -1) {
            if (argIndex >= args.length) {
                break;
            }
            workingStr = workingStr.replace("{?}", args[argIndex]);
            argIndex++;
        }
        return workingStr;
    }
}