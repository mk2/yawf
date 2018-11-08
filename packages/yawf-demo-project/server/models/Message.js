export default class {

  static definition({ DataTypes, Op }) {
    return {
      title:   DataTypes.STRING,
      content: DataTypes.TEXT
    }
  }

}
