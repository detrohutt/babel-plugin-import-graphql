let definitionRefs
export function createDocPerOp (doc) {
  definitionRefs = {}

  doc.definitions.forEach(def => {
    if (def.name) {
      let refs = new Set()
      collectRefs(def, refs)
      definitionRefs[def.name.value] = refs
    }
  })

  let docs = {}
  doc.definitions.forEach((op, i) => {
    if (op.kind === 'OperationDefinition') {
      if (!op.name) throw 'Names are required for a document with multiple Queries/Mutations'

      const curOpDoc = createSingleOperationDoc(doc, op.name.value)
      if (i === 0) {
        docs.default = curOpDoc
        docs[op.name.value] = curOpDoc
      } else {
        docs[op.name.value] = curOpDoc
      }
    }
  })

  return docs
}

function collectRefs ({ kind, type, name, selectionSet, variableDefinitions, definitions }, refs) {
  if (kind === 'FragmentSpread') {
    refs.add(name.value)
  } else if (kind === 'VariableDefinition') {
    const t = type
    if (t.kind === 'NamedType') refs.add(type.name.value)
    if (t.kind === 'NonNullType' && t.type.kind === 'NamedType') refs.add(type.type.name.value)
  }
  // Call recursively for types that may contain FragmentSpread or NamedType, if those types exist
  definitions && definitions.forEach(def => collectRefs(def, refs))
  selectionSet && selectionSet.selections.forEach(sel => collectRefs(sel, refs))
  variableDefinitions && variableDefinitions.forEach(def => collectRefs(def, refs))
}

function findOperation (doc, name) {
  return doc.definitions.find(op => (op.name ? op.name.value == name : false))
}

function createSingleOperationDoc (doc, operationName) {
  // Copy the DocumentNode, but clear out the definitions
  let newDoc = Object.assign({}, doc)
  newDoc.definitions = [findOperation(doc, operationName)]

  // For the current operation, find any fragments referenced by: it, or fragments it references
  let allRefs = new Set()
  let newRefs = new Set(definitionRefs[operationName])
  while (newRefs.size > 0) {
    const prevRefs = newRefs
    newRefs = new Set()
    prevRefs.forEach(refName => {
      if (!allRefs.has(refName)) {
        allRefs.add(refName)
        let childRefs = definitionRefs[refName] || new Set()
        childRefs.forEach(childRef => newRefs.add(childRef))
      }
    })
  }
  allRefs.forEach(refName => {
    const op = findOperation(doc, refName)
    if (op) newDoc.definitions.push(op)
  })

  return newDoc
}
