# SMART Health Links Processing Library

The SMART Health Links (SHLink) Processing Library is a powerful tool for handling SHLinks in web applications. It provides a set of functions to parse, retrieve, and render SHLinks, making it easy to integrate SHLink functionality into your projects.

## Example Rendering

![image](https://github.com/jmandel/shlinker/assets/313089/d9d52b06-cdf6-4249-9342-bd7ff54df90a)

## Key Features

- Parse SHLinks and extract relevant information
- Retrieve files associated with SHLinks
- Render SHLink widgets with customizable options
- Decrypt and handle different file types (FHIR, SMART Health Cards)
- TypeScript support for enhanced developer experience

## Installation

Install the library using npm or yarn:

```bash
npm install shlinker
```

or

```bash
yarn add shlinker
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

## Contributing

Contributions to the SMART Health Links Processing Library are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the library's GitHub repository.

## License

This library is released under the [MIT License](https://opensource.org/licenses/MIT).
