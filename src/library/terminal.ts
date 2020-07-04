import fs from "fs";
import path from "path";

function getStyle(color?: number, format?: number, backgroundColor?: number): string {
  const styles = [backgroundColor || "", format || "", color || ""].join(";");
  return ["\033[", styles, "m"].join("");
}
function getReset(): string {
  return "\033[0m";
}

export enum COLOR_FOREGROUND {
  Black = 30,
  Red,
  Green,
  Yellow,
  Blue,
  Magenta,
  Purple,
  Cyan,
  White
};
export enum COLOR_BACKGROUND {
  Black = 40,
  Red,
  Green,
  Yellow,
  Blue,
  Magenta,
  Cyan,
  White,
}
export enum TEXT_STYLE {
  Normal = 0,
  Bold,
  Dim,
  Underline = 4,
  Blink,
  Inverse,
  Hidden = 8
}

export class TerminalColor {
  private _foreColor: COLOR_FOREGROUND
  private _bgColor: COLOR_BACKGROUND
  private _textStyle: TEXT_STYLE
  private _userOutputFn: (format: string, msg: string) => void
  private _userOutputFile: string
  constructor(output?: ((format: string, msg: string) => void) | string) {
    if (typeof output === "function") {
      this._userOutputFn = output;
    }
    if (typeof output == "string") {
      if (!fs.existsSync(output)) {
        fs.mkdirSync(path.dirname(output), {
          recursive: true
        });
        fs.createWriteStream(output, {
          encoding: "utf-8"
        }).close();
      }
      this._userOutputFile = output;
    }
  }
  color(color: COLOR_FOREGROUND) {
    this._foreColor = color;
    return this;
  }
  bg(color: COLOR_BACKGROUND) {
    this._bgColor = color;
    return this;
  }
  style(style: TEXT_STYLE) {
    this._textStyle = style;
    return this;
  }
  write(text: string, fg?: COLOR_FOREGROUND, bg?: COLOR_BACKGROUND) {
    if (typeof text !== "string") {
      return this;
    }
    if (fg) {
      this.color(fg);
    }
    if (bg) {
      this.bg(bg);
    }
    this._output(getStyle(this._foreColor, this._textStyle, this._bgColor), text);
    return this;
  }
  writeln(text: string, fg?: COLOR_FOREGROUND, bg?: COLOR_BACKGROUND) {
    this.write(text, fg, bg);
    this.newline();
    return this;
  }
  reset() {
    this._foreColor = null;
    this._bgColor = null;
    this._textStyle = null;
    this._output(getReset(), "");
    return this;
  }
  newline() {
    this._output("", "\n");
    return this;
  }
  private _output(format: string, msg: string): void {
    if (this._userOutputFn) {
      this._userOutputFn(format, msg);
      return;
    }
    if (this._userOutputFile && fs.existsSync(this._userOutputFile)) {
      fs.appendFileSync(this._userOutputFile, msg, {
        encoding: "utf-8"
      });
    }
    process.stdout.write(format + msg, "utf-8");
  }
}

export const Terminal = new TerminalColor();