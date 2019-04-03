let the_d =
  "M195,100 L160,160.622 90,160.622 55,100 90,39.378 160,39.378 195,100";
thePath.setAttributeNS(null, "d", the_d);
let BB = thePath.getBBox();
theSVG.setAttributeNS(
  null,
  "viewBox",
  `${BB.x - 10} ${BB.y - 10} ${BB.width + 20} ${BB.height + 20}`
);

function getArgs(d) {
  //d="M195,100 L160,160.622 90,160.622 55,100 90,39.378 160,39.378 195,100 "
  //remove breaklines and tabs and spaces
  let _d = d.replace(/\r?\n|\r|\t|  +/g, "");

  if (_d.charAt(0) == "m") {
    _d = "M" + _d.slice(1);
  }
  let argsRX = /(?=[a-zA-Z])/;
  let args = _d.split(argsRX);

  return args; //["M195,100 ", "L160,160.622 90,160.622 55,100 90,39.378 160,39.378 195,100"]
}

//console.log(getArgs(_d));

function getArgsRys(d) {
  let args = getArgs(d);
  //args = ["M195,100 ", "L160,160.622 90,160.622 55,100 90,39.378 160,39.378 195,100"]
  let ArgsRy = [];

  for (let i = 0; i < args.length; i++) {
    let values = args[i]
      .slice(1)
      .replace(/\-/g, " -")
      .split(/[ ,]+/);

    values.map((p, i) => {
      if (p == "") {
        values.splice(i, 1);
      }
    });

    let ry = [args[i].charAt(0)].concat(values);
    ArgsRy.push(ry);
  }
  return ArgsRy;
  //[["M","195","100"], ["L","160","160.622", "90","160.622", "55","100", "90","39.378", "160","39.378", "195","100"]]
}

//console.log(getArgsRys(_d));

function formatedArgsArray(d) {
  //takes care of long commands
  //[["M","195","100"], ["L","160","160.622", "90","160.622", "55","100", "90","39.378", "160","39.378", "195","100"]]
  let ArgsRy = getArgsRys(d);
  let newArgsArray = [];
  ArgsRy.map((a, index) => {
    let prefix = a[0];
    let UCprefix = prefix.toUpperCase();

    let n, tempRy;
    if (UCprefix == "H" || UCprefix == "V") {
      n = 1;
    }
    if (UCprefix == "L" || UCprefix == "T" || UCprefix == "M") {
      n = 2;
    }
    if (UCprefix == "S" || UCprefix == "Q") {
      n = 4;
    }
    if (UCprefix == "C") {
      n = 6;
    }
    if (UCprefix == "A") {
      n = 7;
    }
    if (a.length > n + 1) {
      //if the length of the array a is longer than it should be
      tempRy = a.splice(1);
      //long_Absolute_command returns an array of arrays
      let newTempsArray = long_Absolute_command(tempRy, n, prefix);
      ArgsRy[index] = newTempsArray;
    }
  });

  ArgsRy.map(a => {
    if (Array.isArray(a[0])) {
      //if it's an array of arrays
      a.map(_a => {
        newArgsArray.push(_a);
      });
    } else {
      newArgsArray.push(a);
    }
  });

  return newArgsArray;

  ////[["M","195","100"], ["L","160","160.622"], ["L","90","160.622"], ["L","55","100"], ["L","90","39.378"], ["L","160","39.378"], ["L","195","100"]]
}

let the_d_ry = formatedArgsArray(the_d);
TAoutput.value = viewArray(the_d_ry);

TAinput.addEventListener("input", () => {
  the_d = TAinput.value;

  the_d_ry = formatedArgsArray(the_d);
  TAoutput.value = viewArray(the_d_ry);

  thePath.setAttributeNS(null, "d", the_d);
  let BB = thePath.getBBox();
  theSVG.setAttributeNS(
    null,
    "viewBox",
    `${BB.x - 10} ${BB.y - 10} ${BB.width + 20} ${BB.height + 20}`
  );
});

function joinRy2d(argsRy) {
  //console.log(argsRy)
  //let argsRy = [["M", "9", "15"],["C", "9", "20", "0", "21", "0", "16"],["C", "0", "11", "6", "9", "10", "0"],["C", "14", "9", "20", "11", "20", "16"],["C", "20", "21", "11", "20", "11", "15"],["C", 11, 18, 12, 20, 13, 20],["C", "11", "20", "9", "20", "7", "20"],["C", "8", "20", "9", "18", "9", "15"],["Z"]]
  let d = "";

  for (let i = 0; i < argsRy.length; i++) {
    let arg = argsRy[i];
    let _str = arg[0]; //the commend
    for (let j = 1; j < arg.length; j++) {
      _str += Number(arg[j]);
      if (j % 2 == 0) {
        _str += " ";
      } else {
        _str += ", ";
      }
    }

    d += _str;
  }

  return d;
}

//console.log(joinRy2d(newArgsArray))

function long_Absolute_command(tempRy, n, prefix) {
  /* This function is splitting a long command like this:  ["L", 160", "160.622", "90", "160.622", "55", "100", "90", "39.378", "160", "39.378", "195", "100"] in several L commands: */
  //tempRy = ["160", "160.622", "90", "160.622", "55", "100", "90", "39.378", "160", "39.378", "195", "100"]
  //prefix = "L"
  //n = 2 (After the L comes 2 coords: x and y)

  let CommandsRy = [];

  while (tempRy.length > 0) {
    CommandsRy.push(tempRy.splice(0, n));
  }

  CommandsRy.forEach(c => {
    c = c.unshift(prefix);
  });

  // CommandsRy = [["L", "160", "160.622"],["L", "90", "160.622"],["L", "55", "100"],["L", "90", "39.378"],["L", "160", "39.378"],["L", "195", "100"]]

  return CommandsRy;
}

//------------------------

function sqBracketsArray(ry) {
  if (Array.isArray(ry)) {
    strRy.push("[");
    ry.map(r => {
      sqBracketsArray(r);
    });
    strRy.push("]");
  } else {
    strRy.push(ry);
  }
}
//let strRy = [];
function viewArray(ry) {
  strRy = []; // global var
  sqBracketsArray(ry);
  let str = strRy
    .join()
    .replace(/([a-zA-Z])/g, "\42$1\42")
    .replace(/\[,/g, "[")
    .replace(/,\]/g, "]")
    .replace(/\],\[/g, "],\n\t[")
    .replace(/\[\[/g, "[\n\t[")
    .replace(/\]\]/g, "]\n]");

  return str;
}
