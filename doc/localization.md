# Localization

Paella Player includes very basic APIs for translating strings from dictionaries. All plugins that are implemented must use these APIs, but it is possible to configure them so that internally it is possible to delegate string translation to other libraries.



## Localization API

You can access the localization API through the player object or you can import the localization API

**Using player object:** 

```javascript
player.setLanguage('es');
console.log(`Current language: ${ player.getLanguage() }`);
console.log(player.translate("Hello"));
```



**Importing localization API:**

```javascript
import { setLanguage, getLanguage, translate } from 'paella-core';

setLanguage('es');
console.log(`Current language: ${ getLanguage() }`);
console.log(translate('Hello'));
```



## Loading dictionaries

To add new dictionaries, you can use the `addDictionary` API function:

```javascript
import { addDictionary } from 'paella-core';
```



You can load dictionaries using the Paella Player initialization object:

```javascript
import { addDictionary } from 'paella-core';
...
const initParams = {
  ...
  loadDictionaries: player => {
    addDictionary('es',{
      "Hello": "Hola",
      "World": "Mundo"
    })
  }
}
...
```

For more information about Paella Player initialization, check [this document](initialization.md).



## Using custom localization library

You can use the Paella Player initialization object to define custom translation functions through callbacks. In these functions you can make a call to a third party localization library. This is interesting, for example, to integrate Paella Player with the localization library you are using in your web site.



```javascript

// My own localization library:
// Objects to store the custom localization dictionaries
const localization = {
  _dict: {},
  _lang: navigator.language.substring(0,2),
  translate: (word) => {
    return this._dict[this._lang] && this._dict[this._lang][word] || word;
  },
  addDictionary: (lang, dict) => this._dict[lang] = dict
}

// Or you can use a third party localization library, such as i18n


const initParams = {
  ...
  setLanguageFunction: lang => localization._lang = lang,
	getLanguageFunction: () => localization._lang,
	translateFunction: (word) => localization.translate(word),
	addDictionaryFunction: (lang, dict) => localization.addDictionary(lang,dict)
	...
}
```

