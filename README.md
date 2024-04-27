# SHLinker: SMART Health Links Processing Library

SHLinker helps web applications work with SMART Health Links and display them consistently. It provides functions to parse, retrieve, and render SHLinks, making it easy to integrate SHLink functionality into your projects.

## Key Features

- Parse SHLinks and extract relevant information
- Retrieve files associated with SHLinks
- Render SHLink widgets with customizable options
- Decrypt and handle different file types (FHIR, SMART Health Cards)
- TypeScript support for enhanced developer experience

## Static Example

If you don't want to use a build process, you can always download or link to our CSS and JavaScript files:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SHLinker Test</title>
  </head>
  <body>
    <div id="main"></div>
    <script type="module">
      import * as shlink from "https://cdn.jsdelivr.net/npm/shlinker@0.2.1/dist/shlinker.js";
      // ^^ Or download and use a local copy

      // pass a shl directly, or let the library parse it from window.location
      const parsed = await shlink.parse("https://joshuamandel.com/cgm/#shlink:/eyJ1cmwiOiJodHRwczovL2pvc2h1YW1hbmRlbC5jb20vY2dtL3NobC8xMjBkYXlfYWdwX2J1bmRsZV91bmd1ZXNzYWJsZV9zaGxfaWQwMDAwMDAwIiwiZmxhZyI6IkxVIiwia2V5IjoiYWdwX29ic191bmd1ZXNzYWJsZV9yYW5kb21fa2V5MDAwMDAwMDAwMDAwMCIsImxhYmVsIjoiSm9zaCdzIENHTSBEYXRhIn0");
      const retrieved = await shlink.retrieve(parsed)
      const main = document.getElementById("main")
      shlink.render(retrieved, main, { showDetails: true})
    </script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shlinker@0.2.1/dist/shlinker.css" />
    <!-- ^^ Or download and use a local copy --/>
  </body>
</html>
```


## Installation

Or If you're using a build process, install the library using npm or its ilk:

```bash
npm install shlinker
```

or

```bash
bun install shlinker
```

## Usage

Import the library and use its functions:

```typescript
import { parse, retrieve, render } from 'shlinker';

// Parse an SHLink
const shlinkData = parse('shlink:/...');

// Retrieve files associated with the SHLink
const retrievedData = await retrieve(shlinkData, { recipient: 'John Doe' });

// Render the SHLink widget
const container = document.getElementById('shlink-container');
render(retrievedData, container, { showDetails: true });
```

## API Reference

### `parse(shlink?: string): SHLinkData`

Parses an SHLink and extracts relevant information.

- `shlink` (optional): The SHLink to parse. If not provided, the current page URL will be used.

Returns an `SHLinkData` object containing the parsed information.

### `retrieve(shlinkData: SHLinkData, options?: RetrieveOptions): Promise<SHLinkData>`

Retrieves files associated with an SHLink.

- `shlinkData`: The parsed SHLink data obtained from `parse()`.
- `options` (optional): Additional options for file retrieval.
  - `recipient` (optional): The recipient of the SHLink.
  - `passcode` (optional): The passcode required to access the SHLink files.

Returns a promise that resolves to an updated `SHLinkData` object with the retrieved files.

### `render(shlinkData: SHLinkData, container: Element, config?: RenderConfig): void`

Renders the SHLink widget using the provided SHLink data.

- `shlinkData`: The parsed SHLink data obtained from `parse()` or `retrieve()`.
- `container`: The DOM element where the SHLink widget will be rendered.
- `config` (optional): Configuration options for rendering the SHLink widget.
  - `showDetails` (optional): Determines whether to show additional details in the widget. Default is `true`.
  - `viewerPrefix` (optional): The prefix to use when generating the SHLink URL for viewing.

## Customization

The `render()` function accepts a `RenderConfig` object that allows you to customize the rendering of the SHLink widget.

- `showDetails` (optional): Set to `true` to display additional details such as label, file count, and total size. Default is `true`.
- `viewerPrefix` (optional): Specify a custom prefix to use when rendering the SHLink URL for copy-to-clipboard or QR display. Default is the original prefix from the parsed SHLink. Pass `null` to explicitlty strip any prefix from the link.

Example:

```typescript
render(shlinkData, container, {
  showDetails: false,
  viewerPrefix: 'https://example.com/viewer',
});
```

### CSS

You can use our supplied CSS to style the widget based on `.class`, or
you can customize the styling. Either way, include a `shlinker.css` in your
page.  See [`src/shlinker.css`](./src/shlinker.css).


### Sizing

If you render the widget into an explicitly sized div, it will adjust to fit.

## Contributing

Contributions to the SMART Health Links Processing Library are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the library's GitHub repository.

## License

This library is released under the [MIT License](https://opensource.org/licenses/MIT).
