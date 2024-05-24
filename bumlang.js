const fs = require("fs");

function Bumlang(size = 32768) {
  this.memory = new Array(size).fill(0);
  this.code = [];
  this.ptr = 0;
  this.pc = 0;
  this.jumpTo = {};
}

Bumlang.prototype.load = function (code) {
  const rawCode = code
    .split("처음")[1]
    .split("마지막")[0]
    .split("");
  let read = 0;

  while (read < rawCode.length) {
    if (rawCode[read] === "증") {
      if (rawCode[read + 1] === "가") {
        this.code.push("+");
        read += 2;
      }
    } else if (rawCode[read] === "저" && rawCode[read + 1] === "장") {
      this.code.push(",");
      read += 2;
    } else if (rawCode[read] === "위" && rawCode[read + 1] === "치") {
        if (rawCode[read + 2] === "증" && rawCode[read + 3] === "가") {
            this.code.push(">");
            read += 4;
          } else if (rawCode[read + 2] === "감" && rawCode[read + 3] === "소") {
            this.code.push("<");
            read += 4;
          }
    } else if (rawCode[read] === "감" && rawCode[read + 1] === "소") {
      this.code.push("-");
      read += 2;
    } else if (rawCode[read] === "출" && rawCode[read + 1] === "력") {
      this.code.push(".");
      read += 2;
    } else if (rawCode[read] === "반" && rawCode[read + 1] === "복") {
      if (rawCode[read + 2] === "시" && rawCode[read + 3] === "작") {
        this.code.push("[");
        read += 4;
      }
      if (rawCode[read + 2] === "끝") {
        this.code.push("]");
        read += 3;
      }
    }  else {
      read += 1;
    }
  }
};

Bumlang.prototype.preprocess = function () {
  const stack = [];
  for (let i = 0; i < this.code.length; i += 1) {
    const command = this.code[i];
    if (command === "[") {
      stack.push(i);
    } else if (command === "]") {
      if (stack.length === 0) throw new Error("Syntax error");

      this.jumpTo[i] = stack.pop();
      this.jumpTo[this.jumpTo[i]] = i;
    }
  }

  if (stack.length > 0) throw new Error("Syntax error");
};

Bumlang.prototype.increasePtr = function () {
  if (this.ptr >= this.memory.length - 1) throw new Error("Out of memory");
  this.ptr += 1;
};

Bumlang.prototype.decreasePtr = function () {
  if (this.ptr <= 0) throw new Error("Out of memory");
  this.ptr -= 1;
};

Bumlang.prototype.increaseValue = function () {
  this.memory[this.ptr] += 1;
};

Bumlang.prototype.decreaseValue = function () {
  this.memory[this.ptr] -= 1;
};

Bumlang.prototype.printValue = function () {
  process.stdout.write(String.fromCharCode(this.memory[this.ptr]));
};

Bumlang.prototype.storingValue = function () {
  let buffer = Buffer.alloc(1);
  fs.readSync(0, buffer, 0, 1);
  this.memory[this.ptr] = buffer.toString("utf8").charCodeAt(0);
};

Bumlang.prototype.jump = function (command) {
  if (command === "[" && this.memory[this.ptr] === 0) {
    this.pc = this.jumpTo[this.pc];
  } else if (command === "]" && this.memory[this.ptr] !== 0) {
    this.pc = this.jumpTo[this.pc];
  }
};

Bumlang.prototype.run = function () {
  this.preprocess();

  while (this.pc < this.code.length) {
    const command = this.code[this.pc];

    if (command === ">") this.increasePtr();
    else if (command === "<") this.decreasePtr();
    else if (command === "+") this.increaseValue();
    else if (command === "-") this.decreaseValue();
    else if (command === ".") this.printValue();
    else if (command === ",") this.storingValue();
    else if (command === "[" || command === "]") this.jump(command);

    this.pc += 1;
  }
};

fs.readFile(process.argv[2], function (err, data) {
  if (err) throw new Error(err.message);
  const bum = new Bumlang();
  bum.load(data.toString());
  bum.run();
  process.stdout.write("\n");
});
