function generateJavaScriptFromAST(ast, indent = 0) {
  const INDENT = '  '.repeat(indent);
  if (!ast) return '';

  switch (ast.type) {
    case "Program":
      const imports = (ast.imports || []).map(im => `// import ${im.path}`).join('\n');
      const topLevel = (ast.topLevelElements || []).map(e => generateJavaScriptFromAST(e, indent)).join('\n\n');
      return `${imports}\n\n${topLevel}`;

    case "Class":
      const classMembers = ast.members.map(member => generateJavaScriptFromAST(member, indent)).join('\n');
      return `${INDENT}// Class ${ast.name}\n${classMembers}`;

    case "Field":
      const fieldInit = generateJavaScriptFromAST(ast.initializer, 0);
      return `${INDENT}let ${ast.fieldName} = ${fieldInit};`;

    case "Method":
      const params = (ast.params || []).map(p => p.name).join(', ');
      const body = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}function ${ast.name}(${params}) {\n${body}\n${INDENT}}`;

    case "GlobalFunction":
      const gParams = (ast.params || []).map(p => p.name).join(', ');
      const gBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}function ${ast.name}(${gParams}) {\n${gBody}\n${INDENT}}`;

    case "VariableDeclaration":
      const varValue = generateJavaScriptFromAST(ast.initializer, 0);
      return `${INDENT}let ${ast.varName} = ${varValue};`;

    case "Block":
      return (ast.statements || []).map(stmt => generateJavaScriptFromAST(stmt, indent)).join('\n');

    case "ExpressionStatement":
      return `${INDENT}${generateJavaScriptFromAST(ast.expression)};`;

    case "IfStatement":
      const cond = generateJavaScriptFromAST(ast.condition);
      const thenBlock = generateJavaScriptFromAST(ast.thenBlock, indent + 1);
      const elseBlock = ast.elseBlock
        ? ` else {\n${generateJavaScriptFromAST(ast.elseBlock, indent + 1)}\n${INDENT}}`
        : '';
      return `${INDENT}if (${cond}) {\n${thenBlock}\n${INDENT}}${elseBlock}`;

    case "WhileStatement":
      const whileCond = generateJavaScriptFromAST(ast.condition);
      const whileBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}while (${whileCond}) {\n${whileBody}\n${INDENT}}`;

    case "ForStatement":
      const init = generateJavaScriptFromAST(ast.init);
      const condition = generateJavaScriptFromAST(ast.condition);
      const update = generateJavaScriptFromAST(ast.update);
      const forBody = generateJavaScriptFromAST(ast.body, indent + 1);
      return `${INDENT}for (${init} ${condition}; ${update}) {\n${forBody}\n${INDENT}}`;

    case "ReturnStatement":
      const ret = ast.expression ? generateJavaScriptFromAST(ast.expression) : '';
      return `${INDENT}return ${ret};`;

    case "BinaryOp":
      return `${generateJavaScriptFromAST(ast.left)} ${ast.operator} ${generateJavaScriptFromAST(ast.right)}`;

    case "UnaryOp":
      return `${ast.operator}${generateJavaScriptFromAST(ast.expr)}`;

    case "Literal":
      return ast.literalType === 'string' ? `"${ast.value}"` : ast.value;

    case "Identifier":
      return ast.name;

    case "FunctionCall":
      return `${generateJavaScriptFromAST(ast.callee)}(${(ast.args || []).map(arg => generateJavaScriptFromAST(arg)).join(', ')})`;

    case "ArrayAccess":
      return `${generateJavaScriptFromAST(ast.arrayExpr)}[${generateJavaScriptFromAST(ast.indexExpr)}]`;

    case "NewArray":
      const arrSize = generateJavaScriptFromAST(ast.sizeExpr);
      return `new Array(${arrSize}).fill(0)`;

    case "NewObject":
      return `new ${ast.className}(${(ast.args || []).map(arg => generateJavaScriptFromAST(arg)).join(', ')})`;

    case "Cast":
      const castExpr = generateJavaScriptFromAST(ast.expr);
      if (ast.castType === "int") return `Math.floor(${castExpr})`;
      else return `${castExpr} /* cast to ${ast.castType} */`;

    default:
      return `${INDENT}// Unhandled AST node: ${ast.type}`;
  }
}

module.exports = { generateJavaScriptFromAST };
