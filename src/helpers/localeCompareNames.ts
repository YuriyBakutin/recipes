interface IWithName {
  name: string
}

export default (a: IWithName, b: IWithName) => a.name.localeCompare(b.name)
