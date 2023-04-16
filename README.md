# Bókin um vef­forritun

Grunnkóði fyrir bókin um vefforritun: lærðu að smíða vefi með HTML og CSS.

Allir kaflar sem Markdown í `./chapters`.

Til að útbúa vefútgáfu þarf að hafa Node.js (útgáfa 14+) uppsett og keyra:

```bash
npm install
npm run generate
```

Markdown er þýtt yfir í HTML út frá lýsigögnum í `./book.json`, með sértækri virkni fyrir ýmislegt.

Þýðing á hverri skrá er geymd í `cache/` möppu til að flýta fyrir seinni keyrslum.

Niðurstaða er skrifuð í `build/`.

## Skjáskot

Skjáskot eru tekin í Firefox með manual „responsive design mode“ og

```bash
:screenshot --fullpage --dpr 2
```

## Málfar

Reynt er að virða eftirfarandi reglur í texta:

- Kynlaus persónufornöfn og ekki nota „maður“ heldur frekar „manneskja“ eða „einstaklingur“.
- Oxford komma.
- Listar enda á punkti.
- Listar hafa aldrei undirlista.
- Ekki nota aðrar skammstafanir en `t.d.`.

### Hjálpar skripta

Haldið er utan um óæskileg orð í `wordlist.txt`, hægt að athuga notkun með `npm run wordlist`.

## Test

Test eru skrifuð í `jest` og geymd í `./src/tests`. Notar [`Stryker Mutator`](`Stryker Mutator`) fyrir [mutation test](https://en.wikipedia.org/wiki/Mutation_testing).

Til að keyra:

```bash
npm test
npm test -- --watch # í watch mode
npm run coverage # sýnir coverage á öllum skrám
npm run stryker # keyrir stryker mutations + test
```
