#!/usr/bin/env python3
"""Flesch-Kincaid grade for a markdown/HTML/text file: readlevel.py FILE [--show N]"""
import re, sys, html

def visible_text(src):
    m = re.search(r"<x-dc>(.*)</x-dc>", src, re.S)
    body = m.group(1) if m else src
    body = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", body, flags=re.S | re.I)
    body = re.sub(r"</(p|h1|h2|h3|li|div|summary|details|small|span|a|b|label|button|section|footer|header)>", ". ", body, flags=re.I)
    body = re.sub(r"<br\s*/?>", ". ", body, flags=re.I)
    body = re.sub(r"<[^>]+>", " ", body)
    body = html.unescape(body)
    body = re.sub(r"^#{1,6}\s*", "", body, flags=re.M)      # markdown headings
    body = re.sub(r"[*_`>|]+", " ", body)                   # markdown marks
    body = re.sub(r"\{\{[^}]*\}\}", " ", body)
    return re.sub(r"[ \t\r\n]+", " ", body)

def syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w: return 0
    if len(w) <= 3: return 1
    w = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", w); w = re.sub(r"^y", "", w)
    return max(1, len(re.findall(r"[aeiouy]{1,2}", w)))

def sentences(text):
    out = []
    for p in re.split(r"(?<=[.!?])\s+|\.\s+", text):
        words = re.findall(r"[A-Za-z][A-Za-z'’-]*", p.strip(" .·—–-"))
        if len(words) >= 2: out.append((p, words))
    return out

def fk(words, sents, syls):
    return 0.0 if not words or not sents else 0.39 * (words / sents) + 11.8 * (syls / words) - 15.59

def main():
    path = sys.argv[1]; show = int(sys.argv[sys.argv.index("--show") + 1]) if "--show" in sys.argv else 10
    sents = sentences(visible_text(open(path, encoding="utf-8").read()))
    nw = sum(len(w) for _, w in sents); ns = len(sents); nsy = sum(syllables(x) for _, w in sents for x in w)
    print(f"{path}\n  words {nw}  sentences {ns}  words/sentence {nw/max(ns,1):.1f}  syllables/word {nsy/max(nw,1):.2f}\n  Flesch-Kincaid grade {fk(nw, ns, nsy):.1f}")
    scored = sorted(((fk(len(ws), 1, sum(syllables(x) for x in ws)), len(ws), s) for s, ws in sents), reverse=True)
    print(f"  hardest {show} sentences:")
    for g, n, s in scored[:show]: print(f"   {g:5.1f} ({n:2d}w) {s[:140]}")

if __name__ == "__main__": main()
