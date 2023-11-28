import ChildDataObj from "./ChildDataObj";

export default interface Data<Type> {
  after: string;
  children: Array<ChildDataObj<Type>>;
}
