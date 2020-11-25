(to [lo jbobau panra be dei](./KOMITCIDU.md) toi)

fanzygerna
==========

fanzygerna is a grammar for Lojban incorporating many experimental changes. [Try it!](https://mezohe.github.io/gentufa/glosser/glosser.htm)

### Characteristics

Many features are copied from [the exp and beta variants of ilmentufa](https://github.com/lojban/ilmentufa/), [zantufa](https://github.com/guskant/gerna_cipra), or [zasni gerna](https://mw.lojban.org/lmw/zasni_gerna). Like in [tersmu](https://gitlab.com/zugz/tersmu), the morphology is extracted into a separate PEG.

fanzygerna is a cmevla-brivla-merging, connective-unifying (including VUhU), tag-unifying, [cekitau](https://mw.lojban.org/ce_ki_tau_jau)-optional grammar.

#### Unique to fanzygerna

* Grammar of descriptions: the cmavo {su'oi}, {ro'oi}, {no'oi}, {ru'oi} are moved to selmaho LE. The description grammar is changed such that {LE KOhA GOhA KU} is no longer allowed, and {LE KOhA KU} is allowed instead. This is the original motivation for fanzygerna, and also the reason for its name.
* Expansion of connectives: selmaho NAhE, SE, LE, LI, LOhOI, and afterthought connectives themselves, can be connected (the first two in forethought only).
* The morphology has a unified brivla rule, and includes only those rafsi rules needed to implement slinkuhi test. Slinkuhi words themselves are allowed after a pause.
* Cmavo shaped like members of selmaho UI are automatically recognized as such, unless they explicitly belong to another selmaho.
* Implementation detail: rule templates are used to shorten repetitive rules, as used in [eaburns's Toaq parser/transformer](https://github.com/eaburns/toaq).

#### Notably absent

* Magic words other than ZO, ZEI, BU (this is temporary)
* KE-BO-termsets, because replacing CEhE with BO is a messy undertaking
* I-JA inside subsentences, out of personal preference; JA-I and TUhE are supported, however
* Unary afterthought JA, because it may be in conflict with JACU
* GA or other gek styles as tanru connectives (guheks have to stay anyway for forethought connection of connectives and tags)
* NOI on selbri
* digit-string and lerfu-string split

### Requirements

For generating a PEG.js grammar engine from its PEG grammar file, you need to have Node.js installed on your machine.  [PEG.js itself](https://github.com/pegjs/pegjs) (slightly modified to work around our own bugs) is already included in this repo.

### Building a parser

After having entered the gentufa directory, run the following commands:

```
node pegjs_conv.js fanzatufa-stura.peg
node build-camxes.js fanzatufa-morfo.js.peg
node build-camxes.js fanzatufa-stura.pegjs
```

Now, the grammar engines should have been created. Run ``node fanzatufa-cmdline.js 'ti mo'`` or load ``glosser/glosser.htm`` to try it out. You can also run the IRC bot at ``irc/fanza-bot.js`` after installing the irc package from npm.

### Other parsers

In the morfologi branch of this repository, there are five unmaintained parsers:

* spagetufa, a sort of ancestor to fanzygerna, but configurable to a fault and including some more radically experimental features,
* morfopoho, a direct ancestor to the morphology grammar of fanzygerna,
* two separate attempts at parsing gua\spi, neither complete
* a version of Randall Holmes's Loglan parser modified to show terminator elision

