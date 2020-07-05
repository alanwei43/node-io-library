export declare enum COLOR_FOREGROUND {
    Black = 30,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Magenta = 35,
    Purple = 36,
    Cyan = 37,
    White = 38
}
export declare enum COLOR_BACKGROUND {
    Black = 40,
    Red = 41,
    Green = 42,
    Yellow = 43,
    Blue = 44,
    Magenta = 45,
    Cyan = 46,
    White = 47
}
export declare enum TEXT_STYLE {
    Normal = 0,
    Bold = 1,
    Dim = 2,
    Underline = 4,
    Blink = 5,
    Inverse = 6,
    Hidden = 8
}
export declare function getColorPairs(num: number): {
    fg: COLOR_FOREGROUND;
    bg: COLOR_BACKGROUND;
};
export declare class TerminalColor {
    private _foreColor;
    private _bgColor;
    private _textStyle;
    private _userOutputFn;
    private _userOutputFile;
    constructor(output?: ((format: string, msg: string) => void) | string);
    color(color: COLOR_FOREGROUND): this;
    bg(color: COLOR_BACKGROUND): this;
    style(style: TEXT_STYLE): this;
    write(text: string, fg?: COLOR_FOREGROUND, bg?: COLOR_BACKGROUND): this;
    writeln(text: string, fg?: COLOR_FOREGROUND, bg?: COLOR_BACKGROUND): this;
    reset(): this;
    newline(): this;
    private _output;
}
export declare const Terminal: TerminalColor;
