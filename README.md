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
