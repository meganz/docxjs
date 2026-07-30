import { isString } from "./utils";

export enum ns {
    html = "http://www.w3.org/1999/xhtml",
    svg = "http://www.w3.org/2000/svg",
    mathML = "http://www.w3.org/1998/Math/MathML"
}

export type HElement = {
    ns?: ns;
    tagName: "#fragment" | "#comment" | string;
    className?: string;
    style?: string | Record<string, string>;
    children?: (HElement | Node | string)[];
} & Record<string, any>;

const dumb = {
    'BASE': 1,
    'BLINK': 1,
    'EMBED': 1,
    'FRAME': 1,
    'FRAMESET': 1,
    'IFRAME': 1,
    'LINK': 1,
    'MARQUEE': 1,
    'META': 1,
    'OBJECT': 1,
    'SCRIPT': 1,
    'SVG': 1,
    'XML': 1
};

const safe = (e: HTMLElement | string) => {
    const nn = isString(e) ? e : `${e && e.nodeName}`;
    const tag = nn.slice(nn.indexOf(':') + 1).toUpperCase();

    if (!e || dumb[tag]) {
        return false;
    }

    if (!isString(e)) {
        const content = String(e.outerHTML).replace(/[\s\x00-\x19]+/g, '').toLowerCase();

        if (/script:/.test(content)) {

            return false;
        }

        if (tag === 'STYLE'
            && String(e.textContent).replace(/blob:[^-;()]+/g, '').includes('//')) {

            return false;
        }
    }

    return true;
};

export function h(elem: HElement | Node | string) {
    if (isString(elem)) return document.createTextNode(elem);
    if (elem instanceof Node) return elem;

    const { ns, tagName, className, style, children, ...props } = elem;

    if (tagName === "#fragment") return document.createDocumentFragment();
    if (tagName === "#comment") return document.createComment(children && children[0] as string || '');
    if (!safe(tagName)) {
        console.error('UNSAFE tagName', tagName);
        return document.createTextNode("\u{1F95A}");
    }

    const result = (ns ? document.createElementNS(ns, tagName) : document.createElement(tagName)) as HTMLElement | SVGElement | MathMLElement;
    if (className) result.setAttribute("class", className);
    if (style) {
        if (isString(style)) {
            result.setAttribute("style", style);
        } else {
            Object.assign(result.style, style);
        }
    }
    if (props) {
        for (const [key, value] of Object.entries(props))
            if (value !== undefined && !key.toLowerCase().startsWith('on'))
                result[key] = value
    }
    if (children) {
        children.forEach(c => {
            const n = h(c) as HTMLElement;
            if (safe(n)) {
                result.appendChild(n)
            } else {
                console.error('UNSAFE children', c, [n]);
            }
        });
    }
    return result;
}

export function cx(...classNames: (string | false | undefined)[]) {
    return classNames.filter(Boolean).join(" ");
}
