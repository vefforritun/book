---
title: CSS
chapter: 2
---

**bold** texti er bold.

---

_italic_ er italic.

0123456789

---

Á meðan Þessar hugmyndir, ásamt mörgum öðrum, höfðu mikil áhrif á þróun upplýsingatækninnar. Ted Nelson skilgreindi árið 1963 hugtakið _HyperText_: texti á stafrænu formi sem inniheldur vísanir þ.a. lesandi getur strax fengið aðgang að þeim. Textinn er ekki lengur fastur, heldur teygir hann anga sína út og leyfir lesandanum að stýra sinni eigin leið í gegnum hann. „Veldu þitt eigið ævintýri“ bækur útfæra svipað hugtak á hliðstæðan máta.

Hér er inline `inline code` code.

# CSS

## Hvað er CSS?

### Þriðja fyrirsögnin með { } táknum HALLÓ

### Þriðja þriðja

```text
QWERTYUIOPÐASDFGHJKLÆZXCVBNMÁÉÍÓ
qwertyuiopðasdfghjklæzxcvbnmáéíó
1234567890
,.!"#$%&/()==\–<>
{ } >= <= == === != = - – — „ “ ! ?
```

## ÞÆÖÁÉÍÚ Halló þetta er löng fyrirsögn með lönguorðisem&shy;brotnarmeðshy

## 1.2 Markup mál

Við höfum mál sem skilgreinir snið (_markup_) á textanum. Hægt er að skipta þessum málum í almenna flokka:

* _Létt_ (_Lightweight_) – einföld setningarfræði er notuð til að leyfa aðskilnað á ýmsum grunnhugmyndum texta án þess að draga úr læsileika textans, t.d. útbúa fyrirsagnir eða feitletra orð t.d. Markdown
* _Procedural_ – snið er innifalið í texta sem leiðbeiningar um sértækar aðgerðir á textanum, t.d. að gera orð feitletrað. Dæmi væru PostScript og LaTex
* _Presentational_ – [_WYSIWYG_](https://en.wikipedia.org/wiki/WYSIWYG) (What You See Is What You Get) ritlar, sniðið er falið fyrir notendum í formi skjals, t.d. Word
* _Descriptive_ – snið gefur texta merkingu sem er _óháð_ birtingu þess, notast er við _merkingarfræðilegt_ (semantic) snið. Leitast er eftir að lýsa eðli textans en ekki **útliti** hans

### zxcv

## 234

Þegar við höfum skrifað efnið okkar í afskaplega fínu HTML skjali, merkingarbæru og aðgengilegu, langar okkur að ljá það lífi með útliti. Þar sem HTML er _descriptive_ markup mál er því ekki ætlað að tjá útlit en þar kemur CSS inn í myndina.

CSS stendur fyrir [_Cascading Style Sheets_](http://en.wikipedia.org/wiki/Cascading_Style_Sheets) og er _style sheet language_ sem lýsir framsetningu á skjali skrifuðu í markup máli, t.d. HTML, XHTML, XML og SVG. CSS kom fyrst fram á sjónarsviðið árið 1994 þegar [Håkon Wium Lie lagði til _Cascading HTML style sheets_](https://www.w3.org/People/howcome/p/cascade.html). Í tillögunni er farið yfir hvernig vafrinn stjórni að mestu allri birtingu og „the author of HTML documents has no influence over the presentation“, sem var vissulega rétt, fyrir tíma CSS var engin leið til að breyta litum á tenglum!

> “You don't need to be a programmer or a CS major to understand the CSS specifications. You don't need to be over 18 or have a Bachelor's degree. You just need to be very pedantic, very persistent, and very thorough.”
>
> “You don't need to be a programmer or a CS major to understand the CSS specifications. You don't need to be over 18 or have a Bachelor's degree. You just need to be very `pedantic`, very persistent, and very thorough.”
> – [Understanding the CSS Specifications](http://www.w3.org/Style/CSS/read)

```html
<!doctype html>
<!--
  HTML COMMENT!
-->
<html lang="is">
  <head>
    <meta charset="utf-8">
    <title>CSS</title>
    <link rel="stylesheet" href="styles.css">
    <style>
    p {
      font-size: 2em;
    }
    </style>
  </head>
  <body>
    <p>Halló, <span style="text-decoration: italic;">heimur</span></p>
    <p>asdfasdfasdfasdfSHY&shy;asdf</p>
  </body>
</html>
```

Þó svo að það væri ekki hægt að breyta litum á tenglum lét fólk það ekki stoppa sig í að nýta það sem í boði var til að lífga upp á vefsíður. Töflur og gegnsæjar gif myndir tröllriðu öllu eftir að [_Creating Killer Websites_](https://www.killersites.com/killerSites/core.html) kom út og fólk gat loksins tjáð sig á vefnum með _hönnun_.

![Skjáskot af strik.is frá því í maí 2000](../img/strik-2000.jpg "strik.is hannaður með töflum maí 2000, fyrsti vefur til að hljóta hin íslensku vefverðlaun. Credit: Skjáskot frá Wayback Machine: https://web.archive.org/web/20000520102751/http://www.strik.is:80/")

Í dæminu að ofan eru allar þrjár leiðirnar notaðar en hreinlegri og betri lausn er að geyma allar þessar upplýsingar um útlit í CSS:

---

## 1.8 Annað vafrastríðið

Eftir að hætt var að gera vefi með töflum kom nokkur ládeyða yfir vafraframleiðendur og varð hún svo mikil að Microsoft tilkynnti árið 2003 að IE6SP1 yrði seinasti vafrinn þeirra. Það ásamt því að hugtakið [_Web 2.0_ var gert vinsælt af Tim O‘Reilly](https://en.wikipedia.org/wiki/Web_2.0) hleypti nýju lífi í markaðinn um 2004. [Apple gaf út Safari fyrir Mac OSX](http://donmelton.com/2013/01/10/safari-is-released-to-the-world/), byggðan á [KTHML](http://lists.kde.org/?m=104197092318639) árið 2003. WebKit, vélin sem keyrir áfram Safari, var árið 2005 gerð open source af Apple.

***

Fyrsta alvöru vefþróunartólið, [Firebug][1] fyrir Firefox, kom út árið 2006 og gjörbreytti því hvernig vefir voru unnir. Í fyrsta skipti var hægt að breyta á einfaldan hátt, beint í vafranum, hvernig vefir höguðu sér. IE 7.0 kom einnig út árið 2006, fimm árum eftir IE 6.0.

  [1]: http://en.wikipedia.org/wiki/Firebug_(software)

[Hlutdeild vafra 2009-2015.](../img/Usage_share_of_web_browsers.png "Hlutdeild vafra 2009-2015. Mynd: http://en.wikipedia.org/wiki/File:Usage_share_of_web_browsers_(Source_StatCounter).svg")

Með tilkomu iPhone árið 2007 og útgáfu Safari 3.0 á Mac OSX, Windows og iOS, varð vefurinn í fyrsta skipti fyrir alvöru aðgengilegur í símum í almennilegum vafra. Tilraunir til að gera sérstakar vefsíður fyrir iPhone byrjuðu snemma, sérstaklega í ljósi þess að ekki var strax hægt að búa til öpp fyrir iOS.

Google gaf út Chrome vafrann árið 2008, byggðum á Chromium, open source vafra. Chromium var síðan aftur byggður á WebKit. [Árið 2013 var Webkit verkefnið _forkað_](https://blog.chromium.org/2013/04/blink-rendering-engine-for-chromium.html) og til varð ný vafravél, [_Blink_](https://www.chromium.org/blink) sem Chrome notar í dag.

Eitt af því sem hamlaði verulega útbreiðslu nýrrar virkni í vöfrum á fyrstu árum vefsins var það að stanslaust þurfti að sækja nýjar útgáfur af vöfrum. Það gat valdið því að fólk keyrði óuppfærðan vafra í mörg ár og notaði hann til að sinna öllu því sem það þurfti á vefnum, sem aftur gerði það að verkum að flestir stærri vefir urðu að styðja gamla vafra lengur en æskilegt hefði verið. Í dag er þetta minna vandamál þar sem allir vafrar dreifa uppfærslum mjög ört og (í flestum tilfellum) án þess að brjóta neitt á milli uppfærsla. [Chrome var fyrsti vafrinn til að gera þetta](https://blog.codinghorror.com/the-infinite-version/) og er í dag hægt að [sækja _Chrome Canary_](https://www.google.com/chrome/browser/canary.html) sem er útgáfan af Chrome með því allra nýjasta, uppfærð daglega með nýjasta buildi.

Ættartré þeirra vafra sem við notum í dag er orðið frekar flókið og margþætt, en hægt er að skoða það á [evolution of the web](http://www.evolutionoftheweb.com/).


Listi af atriðum:

* [ ] A
* [ ] B
* [x] C

~Ég er hættur við þetta~

```css
img {
  /*
  mynd skalast þ.a. hún fylli alltaf upp í
  lárétt pláss í foreldri
  */
  max-width: 100%;
}
```

```javascript

function foo {
  var i = 1;
  return i + 2;
}

class Reporter {
  constructor({ silent = false, verbose = false } = {}) {
    this.silent = silent;
    this.isVerbose = verbose;
  }

  error(...m) {
    if (!this.silent) {
      console.error(...m);
    }
  }

  warn(...m) {
    if (!this.silent) {
      console.warn(...m);
    }
  }

  verbose(...m) {
    if (this.isVerbose) {
      console.info(...m);
    }
  }
}

const fileContent = await readFileAsync(file);

const {
  content,
  data: {
    title = '',
    chapter: metaChapter = 0,
  } = {},
} = graymatter(fileContent);
```

### 2.26.1 Sass

Sass er töluvert mikið notað og hefur þýðendur í mörgum umhverfum. Eldri útgáfa af málinu notaði `.sass` endingu á skjölum en nýrri („sassy CSS“) notar `.scss`.

Sass útfærir breytur með `$` fyrir framan eigindi og leyfir okkur að nota á öðrum stöðum með virkjum og hjálparföllum:

```scss
// svona komment virka
$blue: #3bbfce;
$margin: 16px;

.box {
  margin: $margin / 2; // eigum við breytu með virkja
  background-color: $blue * 2; // líka fyrir liti!
}
```

sem er þýtt yfir í:

```css
.box {
  margin: 8px;
  background-color: #76ffff;
}
```

Bakendi (e. back-end eða server-side) er sá partur vefsins sem er sendur yfir HTTP til framenda. Bakendinn samanstendur yfirleitt af vefþjón, forriti sem útbýr framenda og einhverri gagnageymslu (t.d. gagnagrunnur). Vefþjónar geta stutt margskonar forritunarmál (t.d. C# eða Python) og forritunarumhverfi (t.d. .NET eða Django).

![Samskipti milli bakenda og framenda fara fram í gegnum HTTP.](../img/framendibakendi.svg)

Stundum er talað um full stack forritun en það er þegar forritari er fær í bæði framenda og bakenda forritun.
