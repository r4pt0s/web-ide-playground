import React, { useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { str } from "./testString";

/* import Editor, { monaco } from "@monaco-editor/react";
 */
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";

import parserBabel from "prettier/parser-babylon";
//import parserBabel from "@babel/parser"; //! UNINSTALL BABEL AGAIN npm uninstall @babel/parser
import prettier from "prettier/standalone";

const espree = require("espree");
const jshint = require("jshint");

const opt = {
  indent_size: 4,
  indent_char: " ",
  indent_with_tabs: false,
  editorconfig: false,
  eol: "\n",
  end_with_newline: true,
  indent_level: 0,
  preserve_newlines: true,
  max_preserve_newlines: 10,
  space_in_paren: false,
  space_in_empty_paren: false,
  jslint_happy: true,
  space_after_anon_function: false,
  space_after_named_function: false,
  brace_style: "collapse",
  unindent_chained_methods: false,
  break_chained_methods: true,
  keep_array_indentation: false,
  unescape_strings: false,
  wrap_line_length: 0,
  e4x: false,
  comma_first: false,
  operator_position: "before-newline",
  indent_empty_lines: false,
  templating: ["auto"],
  space_before_conditional: true
};

const optEspree = {
  // attach range information to each node
  range: false,
  // attach line/column location information to each node
  loc: true,
  // create a top-level comments array containing all comments
  comment: false,
  // create a top-level tokens array containing all tokens
  tokens: false,
  // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
  // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), 2019 (same as 10), or 2020 (same as 11) to use the year-based naming.
  ecmaVersion: 10,
  // specify which type of script you're parsing ("script" or "module")
  sourceType: "script",
  // specify additional language features
  ecmaFeatures: {
    // enable JSX parsing
    jsx: false,
    // enable return in global scope
    globalReturn: true,
    // enable implied strict mode (if ecmaVersion >= 5)
    impliedStrict: false
  }
};

const optPrettier = {
  semi: true,
  parser: "babel-flow",
  plugins: [parserBabel],
  singleQuote: false,
  endOfLine: "auto"
};

function App() {
  const [value, setValue] = useState(str);
  const editorRef = useRef();

  function onLoad(ed) {
    console.log(parserBabel);
    // ESPRIMA PORTION
    //get total line count => editor.session.getLength()
    /*   editorRef.current = ed;
    console.log("i've loaded, ", ed.session.getLength());
    // find certain thing
    ed.find("test", {
      backwards: false,
      wrap: false,
      caseSensitive: false,
      wholeWord: false,
      regExp: false
    });
    ed.findNext();
    ed.findPrevious();
    getTokens(); */
    //editor.getSelectionRange()
  }

  function getTokens() {
    for (let i = 0; i < editorRef.current.session.getLength(); i++) {
      console.log(editorRef.current.session.getTokens(i));
    }
  }
  function onChange(newValue) {
    console.log("change", newValue);
    setValue(newValue);
  }

  function onSelectionChange(newValue, event) {
    console.log("select-change", newValue);
    console.log("select-change-event", event);
  }

  function onCursorChange(newValue, event) {
    console.log("cursor-change", newValue);
    console.log("cursor-change-event", event);
  }

  function onValidate(annotations) {
    console.log("onValidate", annotations);
  }

  function beautify() {
    let b = null;
    try {
      b = prettier.format(value, optPrettier); //js_beautify(value, opt);
      const espAst = espree.parse(b, optEspree);
      setValue(b);
      console.log(espAst);
      console.log(loopThroughFunctionsESPREE(espAst));
    } catch (err) {
      console.log(espree.parse(b, optEspree), err);
      jshint.JSHINT(
        b,
        {
          options: {
            undef: true,
            indent: 4,
            maxerr: 50,
            esversion: 6
          }
        },
        null
      );
      console.log(espree.parse(b, optEspree), err);
    }
    jshint.JSHINT(
      b,
      {
        options: {
          undef: true,
          indent: 4,
          maxerr: 50,
          esversion: 6,
          maxdepth: 10
        }
      },
      null
    );
    const ast = jshint.JSHINT.data();
    //console.log(ast);
    //loopThroughFunctionsJSHINT(ast);
  }

  function loopThroughFunctionsJSHINT(funcs) {
    //for(let i=0; i < funcs.functions.length; i++){
    for (let func of funcs.functions) {
      console.log(`${func.name} from line ${func.line} to ${func.last}`);
    }
  }
  let finalOutput = "";
  let test = "";

  let steps = 0;

  function loopThroughFunctionsESPREE(program) {
    const { body } = program;
    const {
      loc: { end }
    } = program;

    for (let ast of body) {
      console.group(`%cAST GROUP ${ast.type}`, "color:red;font-weight:bold");
      test = "";
      finalOutput = "";
      steps = 0;

      switch (ast.type) {
        case "VariableDeclaration":
          splitVariableDeclaration(ast.declarations);
          break;
        case "FunctionDeclaration":
          console.log(
            `%cFUNCTON DECLARATION ENCOUNTERED: 
          ${ast.id.name} from line ${ast.loc.start.line} to ${ast.loc.end.line}
          FUNCTION BODY`,
            "color:aqua"
          );
          splitStatement(ast.body);
          break;
        case "ExpressionStatement":
          splitExpressionStatement(ast.expression);
          console.log(
            `%cEXPRESSION ENCOUNTERED: 
          line ${ast.loc.start.line} to ${ast.loc.end.line}
          WHAT TO DO: ${finalOutput}
          FINAL STEPS: ${steps}`,
            "color:yellow"
          );
          break;
        default:
          break;
      }
      console.groupEnd(`AST GROUP ${ast.type}`);
    }
  }

  function splitVariableDeclaration(declarations) {
    for (let declaration of declarations) {
      switch (declaration.init.type) {
        case "Literal":
          console.log(
            `%cVariable declaration: ${declaration.id.name} with value ${declaration.init.value} at line ${declaration.init.loc.start.line}`,
            "color:darkviolet"
          );
          break;
        case "ArrowFunctionExpression":
          console.log(
            `%cArrow Function: ${declaration.id.name} at line ${declaration.init.loc.start.line} till ${declaration.init.loc.end.line}`,
            "color:goldenrod"
          );
          splitStatement(declaration.init.body);
          break;
        case "FunctionExpression":
          console.log(
            `%cFunction expression with function keyword: ${declaration.id.name} at line ${declaration.init.loc.start.line} till ${declaration.init.loc.end.line}`,
            "color:goldenrod"
          );
          splitStatement(declaration.init.body);
          break;
        default:
          break;
      }
    }
  }

  function splitStatement(body) {
    switch (body.type) {
      case "BlockStatement":
        for (let statements of body.body) {
          test = "";
          finalOutput = "";
          steps = 0;
          splitStatement(statements);
          //splitExpressionStatement(statements.expression);
        }
        break;
      case "ExpressionStatement":
        splitExpressionStatement(body.expression);
        console.log(test);
      default:
        break;
    }
  }

  function splitExpressionStatement(expression) {
    steps++;
    switch (expression.type) {
      case "CallExpression":
        // console.warn("CALLEXPRESSION");
        const value = `\nVALUE OF CALL: ${
          expression.arguments[0] ? expression.arguments[0].value : "none"
        }`;
        finalOutput += value;
        test += value;
        splitExpressionStatement(expression.callee);
        break;
      case "MemberExpression":
        const temp = `\nMETHOD CHAIN : ${splitExpressionStatement(
          expression.property
        )}`;
        finalOutput += temp;
        test += temp;
        //console.warn("MEMBEREXPRESSION");
        splitExpressionStatement(expression.object);
        break;
      //return expression.property.name;
      case "Identifier":
        const temp2 = `\nFUNCTION CALL: ${expression.name}`;
        //console.warn("IDENTIFIER ", expression);
        finalOutput += temp2;
        test += temp2;
        return expression.name;
      default:
        break;
    }
  }

  // Render editor
  return (
    <>
      <button onClick={beautify}>Beautify me And Play</button>
      <AceEditor
        placeholder="Placeholder Text"
        mode="javascript"
        theme="monokai"
        height="80vh"
        width="700px"
        name="master-the-event-loop"
        onLoad={onLoad}
        onChange={onChange}
        onSelectionChange={onSelectionChange}
        onCursorChange={onCursorChange}
        onValidate={onValidate}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        value={value}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2
        }}
      />
    </>
  );
}

// REACT MONACO
/* function App() {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const valueGetter = useRef();
  const editorRef = useRef();

  function handleEditorDidMount(_valueGetter, editor) {
    setIsEditorReady(true);
    editorRef.current = editor;
    valueGetter.current = _valueGetter;
  }

  function handleShowValue() {
    console.log(valueGetter.current());
  }

  function gotoToLine() {
    editorRef.current.revealPositionInCenter({ lineNumber: 50, column: 120 });
  }

  function tokenizeIt() {
    let m = editorRef.current.getModel();
    let word = m.getWordAtPosition(m.getPositionAt(34));
    console.log(word);
    console.log(editorRef);
    console.log(m.getLineContent(3));
    //console.log(tokenize(word, "Javascript"));
  }

  return (
    <>
      <button onClick={handleShowValue} disabled={!isEditorReady}>
        Show value
      </button>
      <button onClick={gotoToLine} disabled={!isEditorReady}>
        Goto line 50 column 120
      </button>
      <button onClick={tokenizeIt} disabled={!isEditorReady}>
        Print tokens
      </button>
      <Editor
        height="90vh"
        language="javascript"
        value={str}
        editorDidMount={handleEditorDidMount}
        theme="vs-dark"
      />
    </>
  );
}
 */
export default App;
