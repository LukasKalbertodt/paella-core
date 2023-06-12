
# Button plugin

Allows you to add buttons in two different locations:

- The playback bar, located at the bottom of the Paella Player container. In this case, the buttons are added below the time bar.
- The video container, at its top margin.

The buttons can be aligned to the right or left of the playback bar. By default, this setting is specified in the configuration.


```javascript
import { ButtonPlugin } from 'paella-core';

export default class MyButtonPlugin extends ButtonPlugin {
  get side() {
  	return "left"; // or right  
  }
  
  get parentContainer() {
    return "playbackBar";  // or videoContainer
  }

  async mouseOver(target) {
    
  }
  
  async mouseOut(target) {
    
  }
  
  async action() {
    
  }
}
```



## Methods that can be overwritten

Apart from the `Plugin` methods, `ButtonPlugin` provides other methods and properties that can be overridden:

- `get side()`: returns the end where we want to place the button. The default implementation gets this value from the configuration. This method should be overridden only in case we want the button to be always displayed in the same place, regardless of the configuration.
- `get parentContainer()`: returns the container where we want to add the button, which can be either `playbackBar` or `videoContainer`. If this function is not overridden, the value is obtained from the plugin configuration, and if it is not specified in the configuration either, it defaults to `playbackBar`.
- `get titleSize()` (paella-core=>1.4): is used to set the font size of the button title. It can return `small`, `medium` or `large`.

- `async mouseOver(target)`: is called when the mouse enters the button area. See the section on button sections below for more information.
- `async mouseOut(target)`: called when the mouse leaves one of the button areas
- `async focusIn()` (paella-core >= 1.31): called when the button receive the focus, for example, with the tabulator key.
- `async focusOut()` (paella-core >= 1.31): called when the button loses the focus.
- `async action()`: called when the user clicks the button.
- `getDescription()`: is used to return the text of the HTML attribute `title`.
- `getMinContainerSize()` (paella-core >= 1.14): is used to return the minimum container width required to show the plugin in the playback bar. This value is is overridden by the `minContainerSize` attribute of the plugin configuration.
- `getId()` (paella-core>=1.16): Allows to set the `id` attribute of the `<button>` element, in case the `id` property is not defined in the plugin configuration. By default returns `null`.
- `getButtonName()` (paella-core>=1.16): Allows to set the `name` attribute of the `<button>` element, in case the `name` property is not defined in the plugin configuration. By default, returns `null`.
- `getClosePopUps()` (paella-core>=1.22): Indicates whether or not to close pop ups when the button is clicked. By default this option is `true`, but in the case of the [`ButtonGroupPlugin`](button_group_plugin.md) this value is `false` by default.


## Button elements

Internally, the button is composed of four DOM elements:

- `container`: is the container that encompasses the other three parts.
- `button`: it is the clickable area of the button
- `leftArea`: is an empty area to the left of the button
- `rightArea`: is an empty area to the right of button.

All these areas are DOM elements. leftArea and rightArea are empty. The idea is that at any given time we can create a button that includes elements to the right and to the left of the button. An example of this is the volume button, which can be obtained from the [paella-basic-plugins repository](https://github.com/polimediaupv/paella-basic-plugins/blob/main/src/plugins/es.upv.paella.volumeButtonPlugin.js).

These elements are created before the plugin is loaded, so we can access them from the same load:

```javascript
async load() {
  this.leftArea.innerHTML = "Left area";
}
```

The `target` parameter in the `mouseOver` and `mouseOut` functions is the section that triggers the action (over or out), and you can use it to determine what to do in this action:

```javascript
async mouseOver(target) {
  if (target === this.button) {
    console.log("enter button");
  }
}
```

## Other ButtonPlugin APIs

`get iconElement()`: Returns the icon DOM element, that is a child of the `button` element.

`get titleContainer()`: Returns the DOM container of the button title.

`get id()` (paella-core>=1.16): get the `id` attribute to be set in the `<button>` element. This property returns the value of the `id` property of the plugin configuration, and if it is not defined, it returns the value returned by the `getId()` function. If neither of these cases returns a value, then the `id` attribute will not be added to the `<button>` element.

`get buttonName()` (paella-core>=1.16): get the `name` attribute to be set in the `<button>` element. Not to be confused with the `name` attribute of the [`Plugin`](plugins.md) class. This property returns the value of the `name` property of the plugin configuration, and if it's not defined, it returns the value returned by the `getButtonName()` function. If neither of these cases returns a value, it will return the value of the `name` property, that is: the plugin identifier.
`get closePopUps()` (paella-core>=1.22): returns the value of the `closePopUp` property of the plugin configuration, and if not set, then returns the value of the `getClosePopUps()` function. This is used internally by paella-core to determine if we want to close pop ups that are open when this button is pressed.

`hide()`: hide the button.

`show()`: shows the button.

The `hide/show` APIs are used internally for some player actions, for example, to hide buttons when there is not enough space in the playbar. If you want to hide a button permanently, you have to use the `enable/disable` APIs.

`disable()`: disables and hides the button. When the `disabled` state is set, the `show()` function will have no effect when the button is disabled.

`enable()`: enables the button and displays it.


## Button icon

To specify the icon it is necessary to use icons in vector SVG format. This is a prerequisite, since CSS styles are used to specify the color of the icons. To do the loading, using the webpack configuration defined in the [paella player tutorial](tutorial.md), the icon will be automatically embedded in the code. In versions previous to paella-core 1.4, it's mandatory to set an icon.

The button can be set at any time, using the `set icon()` property. For example, we can use the `async load()` method, but we can also change it at another time:

```javascript
...
import myPluginIcon1 from 'icons/my-plugin-icon-1.svg';
import myPluginIcon2 from 'icons/my-plugin-icon-2.svg';

export default class MyButtonPlugin extends ButtonPlugin {
  ...
  async load() {
    this.icon = myPluginIcon1;
  }

	async action() {
    if (this.icon === myPluginIcon1) {
      this.icon = myPluginIcon2;
    }
    else {
      this.icon = myPluginIcon1;
    }
  }
}
```

To load the SVG icons, besides using Webpack, it is possible to use a Paella Player utility that loads the icon and makes it ready to be added as a DOM element:

```javascript
import { utils } from 'paella-core';

...

const icon = await utils.loadSvgIcon(iconPath);
```

## Icon title

To specify the button text, we use the `set title()` accessor. It is possible to change the button text at any time.

```javascript
...
export default class MyButtonPlugin extends ButtonPlugin {
  ...
  get titleSize() { return "small"; }
  
  async load() {
    this.title = "Hello";
  }

	async action() {
    this.title = "World";
  }
}
```


## Configuration

The `parentContainer` property, in its default implementation, gets its value from the plugin configuration, inside the `config.json` file. This property can take several values, two of which are predefined, while the rest are arbitrary:

- `playbackBar`: The button will be placed on the playback bar. This is the default value, if any other is specified.
- `videoContainer`: The button shall be placed inside the [video container](video_container.md). In the vertical axis, the buttons are placed at the top of the container. 
- Any other value: The button will be placed inside a container that match that name. These containers can be created using plugins of type [button group](button_group_plugin.md).

As with `parentContainer`, the `side` property also takes its value from the plugin configuration. This property affects the side on the horizontal axis that the button is placed, and only affects in case `parentContainer` is the playbar or the video container. In this case, this property has only two possible values:

- `left`: The button will be placed on the left side of the playback bar or the video container.
- `right`: The button will be placed on the right side of the playback bar or the video container.

The `minContainerSize` (paella-core >= 1.14) attribute is used to set a minimum required size of the playback bar to show the button plugin. By default, this value is zero.

The `tabIndex` attribute defines the tab index to be used for scrolling through the buttons using the tab key.

The `ariaLabel` attribute defines the text used in the `aria-label` attribute of the button.

## Non-interactive buttons (paella-core >= 1.4)

It is possible to add non-interactive buttons. Although strictly speaking a non-interactive button is not a button, this allows you to create plugins that are active but not usable. For example, if we want to emphasise that the player supports subtitles, but the current video does not include them, we can add a non-interactive button.

Non-interactive buttons have mouse events, keyboard events and tab stop disabled, and include the `non-interactive` class, as explained below in the section on modifying styles.

To disable the button interaction, you must to return `false` in the property `interactive`. This property is only read at plugin load time, after calling its `isEnabled` function, and before calling its `load` function. Therefore, a button cannot change from interactive to non-interactive during the player's lifecycle:

```js
export default class MyButtonPlugin extends ButtonPlugin {
  ...
  get interactive() {
    return false;
  }
}
```

## Variable width buttons (paella-core 1.4)

By default, buttons have a fixed size that can be configured by CSS, as shown below. But sometimes you may want to add buttons with a variable width, for example, if you want to display text.

If you specify text and an icon, variable-width buttons place the button to the left of the text rather than over the icon.

To specify that you want variable width, you must return the `dynamicWidth` property. As with the `interactive` property, this is read before the plugin is loaded and after the `isEnabled` function is called, so this property remains the same throughout its life cycle.

```js
export default class MyButtonPlugin extends ButtonPlugin {
  ...
  async load() {
    this.icon = testIcon;
    this.title = "Dynamic width button";
  }

  get dynamicWidth() {
    return true;
  }
}
```

## Accesibility

To set up the `aria-label` attribute, you can use the `ariaLlabel` property in the button plugin configuration. In addition, the `description` property in the plugin configuration, will be used as `title` attribute in the button.

```json
{
  "plugins": {
    ...
    "es.upv.paella.myButtonPlugin": {
      "enabled": true,
      "description": "My button description",
      "ariaLabel": "My button accesibility string"
    }
  }
}
```

The texts of both attributes are translated using the [paella player dictionary system](localization.md).

In addition to using the configuration file, it is possible to define the `aria-label` text by implementing the `getAriaLabel()` function, which must return a text string. Note that the text you define in the configuration takes precedence over the text returned by `getAriaLabel()`. This function can be used to return a predefined text, which can be optionally customized by configuring the plugin.

```javascript
export default class MyButtonPlugin extends ButtonPlugin {
  ...
  getAriaLabel() {
    return "My button predefined accesibility string";
  }
  ...
}
```

## Localization

There are a few things to keep in mind regarding location:

- The `ariaLabel` and `description` attributes are translated automatically. Note that these texts are first obtained from the `ariaLabel` and `descriptio` attributes of the plugin configuration, and if this text is not defined in the translation, they will be obtained from the `getAriaLabel()` and `getDescription()` functions. If this texts are defined for these attributes in the configuration, it must be taken into account that the player we implement must also provide translation for these texts so that they can be modified once the player is compiled.
- If we want to parameterize the translations, then we will have to do the translation manually:

```js
getAriaLabel() {
  return this.player.translate("Forward $1 seconds", [30]);
}
```

- The `async load()` function is called after `getAriaLabel()` and `getDescription()`. If we need to initialize something we use in these functions, we will have to do it in the `async isEnabled()` function.

```js
async isEnabled() {
  const enabled = await super.isEnabled();
  this.time = this.config.time;
  return enabled;
}

getAriaLabel() {
  return this.player.translate("Forward $1 seconds", this.time);
}
```

## Style customization

### Button size

From paella-core 1.4, there are four CSS variables that you can use to set the button size: `--button-fixed-width`, `--button-fixed-height`, `--playback-bar-height` and `--button-icon-size`.

The simplest adjustment that can be made to the button styles is to set their size. The button size can be customized using the CSS variables `--button-fixed-width` and `--button-fixed-height`:

```css
:root {
  --button-fixed-width: 40px;
  --button-fixed-height: 40px;
}
```

The size of buttons has an impact on other CSS variables, such as `--playback-bar-height`.

In addition to the size of the buttons, it is also possible to set the size of the button icons using the `--button-icon-size` variable. Note that the icon size should be smaller than the button size. In the default configuration, this size is half the width of the button.

```css
:root {
  --button-icon-size: calc(var(--button-fixed-width) * 0.15);
}
```

### Advanced button configuration

NOTE: The button structure is quite complex and affects several parts of the player. If advanced CSS settings are modified, it is highly recommended to test that they work correctly for all possible button shapes:

- Interactive/non-interactive button
- Fixed width/dynamic width button
- Playback bar/video container/button group

The structure of the button plugins in the playbar is as follows:

```html
<div class="button-plugin-container">
  <div class="button-plugin-side-area left-side">
  </div>
  <button class="button-plugin ">
    <div class="interactive-button-content">
      <i class="button-icon" style="pointer-events: none">
        <svg><!-- svg icon--></svg>
      </i>
      <span class="button-title button-title-medium">
        <!-- icon text -->
      </span>
    </div>
  </button>
  <div class="button-plugin-side-area right-side">
  </div>
</div>
```

Of these elements, there are two parts that can be used by the plugin to add elements to the left or right of the button. For example, the volume plugin in the `paella-basic-plugins` library uses the right area to add the volume control on the mouse hover.

The button itself consists of the main container, which is the `<button class="button-plugin">` element, the icon, which is the `<i class="button-icon">` element and contains an SVG icon that loads the plugin within its code, and the `<span class="button-title">` element.

As button plugins can be used elsewhere in the player, the following selectors are used to style the button, icon and text:

- `.playback-bar .button-plugins .button-plugin-container button`: button on the playback bar.
- `.playback-bar .button-plugins button i`: icon on playback bar button.
- `.button-plugins span.button-title`: text on playback bar button.

In this way, we restrict the changes to those buttons that are in the playback bar. If we want to modify the buttons in the video container, then we use the following selectors:

- `.video-container .button-plugins .button-plugin-container button`: button on video container.
- `.video-container .button-plugins .button-plugin-container button`: icon on video container button.
- `.button-plugins span.button-title`: text on video container button.

Finally, button plugins can also be placed in a popup container (see documentation on button group plugins). These buttons are referenced with the following queries:

- `.button-group .button-plugin-container button`: button on a button group pop up.
- `.button-group button i`: icon on a pop up button.
- `.button-group span.button-title`: text on a pop up button.

Changes to the button's appearance will generally be made to the `button.button-plugin` element.

Remember that to load custom styles you must use [the `loadStyle` function](styles.md).

**Set the button text sizes:**

There are three possible text sizes for button titles. The use of one or another size depends on the plugin's definition, as the plugin knows best which size best suits the use. We can modify the predefined sizes of these three types with the following rules:

```css
/* Playback bar and video container */
.button-plugins span.button-title.button-title-small {
    font-size: 10px;
}
  
.button-plugins span.button-title.button-title-medium {
    font-size: 14px;
}
  
.button-plugins span.button-title.button-title-large {
    font-size: 16px;
}

/* Button group */
.button-group span.button-title.button-title-small {
  font-size: 8px;
}

.button-group span.button-title.button-title-medium {
  font-size: 10px;
}

.button-group span.button-title.button-title-large {
  font-size: 12px;
}
```

**Non-interactive buttons:** for this type of button, the `non-interactive` class is added to the button element, and the button element becomes a `<span>` instead of a `<button>`. As a non-interactive element that will no longer respond to mouse events, the side bins are also not added.

```html
<div class="button-plugin-container">
  <span class="button-plugin non-interactive">
    <div class="non-interactive-button-content">
      <i class="button-icon" style="pointer-events: none">
        <svg><!-- svg icon--></svg>
      </i>
      <span class="button-title button-title-medium">
        <!-- icon text -->
      </span>
    </div>
  </span>
</div>
```


