
function getStyle(color?: number, format?: number, backgroundColor?: number): string {
  const styles = [backgroundColor || "", format || "", color || ""].join(";");
  return ["\033[", styles, "m"].join("");
}
function doReset() {
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
  private _output: (format: string, msg: string) => void
  private _foreColor: COLOR_FOREGROUND
  private _bgColor: COLOR_BACKGROUND
  private _textStyle: TEXT_STYLE
  constructor(output?: (format: string, msg: string) => void) {
    this._output = output || ((format, msg) => process.stdout.write(format + msg));
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
  write(text: string) {
    this._output(getStyle(this._foreColor, this._textStyle, this._bgColor), text);
    return this;
  }
  reset() {
    this._foreColor = null;
    this._bgColor = null;
    this._textStyle = null;
    doReset();
    return this;
  }
  newline() {
    this._output("\n", "");
    return this;
  }
}

export const Terminal = new TerminalColor();