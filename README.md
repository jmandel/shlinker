# SMART Health Links (SHLink) Processing Library

The SMART Health Links (SHLink) Processing Library is a powerful and flexible tool for handling SHLinks in web applications. It provides a set of functions to process, retrieve, and render SHLinks, making it easy to integrate SHLink functionality into your projects.

## Key Features

- **SHLink Processing**: The library allows you to process SHLinks and extract relevant information such as the URL, flag, key, label, and recipient. This data can be used to further retrieve and render the associated files.

- **File Retrieval**: With the library, you can easily retrieve the files associated with an SHLink. It supports both single-file retrieval (indicated by the 'U' flag) and multi-file retrieval based on a manifest. The retrieved files are decrypted and returned as an array of `File` objects containing the file name, size, content, and MIME type.

- **Rendering**: The library provides functionality to render the SHLink data and associated files in a user-friendly way. You can render the SHLink widget either directly to a DOM container or as a standalone UI component.

- **TypeScript Support**: The library is written in TypeScript, providing type safety and enhanced developer experience. The defined interfaces (`SHLinkData`, `File`, `SHLinkWidgetProps`) make it easier to understand and work with the data structures used in the library.

- **Customization**: The SHLink widget can be customized to show or hide additional details about the SHLink, such as the label, total number of files, and total size.

- **QR Code Generation**: The library includes functionality to generate QR codes for SHLinks, making it convenient to share and distribute SHLinks in various contexts.

- **Clipboard Integration**: With the library, you can easily copy SHLinks to the clipboard, enabling quick sharing and distribution of links.

- **File Downloads**: The library provides a seamless way to download all the retrieved files associated with an SHLink. Users can download the files with a single click, making it convenient to access and store the shared data.

## Installation

To install the SMART Health Links Processing Library, you can use npm or yarn:

```shell
npm install shlink-processing-library
```

or

```shell
yarn add shlink-processing-library
```

## Usage

Here's a basic example of how to use the library:

```typescript
import { process, retrieve, render } from 'shlink-processing-library';

const shlink = 'shlink:/...';
const recipient = 'John Doe';

// Process the SHLink
const shlinkData = process(shlink, recipient);
console.log(shlinkData);

// Retrieve the files associated with the SHLink (optional passcode)
const files = await retrieve(shlinkData, '123456');
console.log(files);

// Render the SHLink widget
const container = document.getElementById('shlink-container');
render(shlinkData, container, true); // Display additional details
```

In this example, we first process the SHLink using the `process` function, which extracts the relevant data from the SHLink. Then, we retrieve the associated files using the `retrieve` function, providing the processed SHLink data and an optional passcode. Finally, we render the SHLink widget using the `render` function, specifying the SHLink data, the target DOM container, and a boolean flag to show additional details.

## API Reference

### `process(shlink?: string, recipient?: string): SHLinkData`

Processes the given SHLink and extracts relevant information.

- `shlink` (optional): The SHLink to be processed. If not provided, it will be extracted from the current page URL.
- `recipient` (optional): The recipient name. Defaults to 'Generic Recipient'.

Returns an `SHLinkData` object containing the processed SHLink information.

### `retrieve(shlinkData: SHLinkData, passcode?: string): Promise<SHLinkData>`

Retrieves the files associated with the given SHLink data.

- `shlinkData`: The processed SHLink data obtained from the `process` function.
- `passcode` (optional): The passcode required to access the SHLink files, if applicable.

Returns a promise that resolves to an updated `SHLinkData` object with the retrieved files.

### `render(shlinkData: SHLinkData, container: Element, showDetails?: boolean): void`

Renders the SHLink widget using the given SHLink data.

- `shlinkData`: The processed SHLink data obtained from the `process` function.
- `container`: The DOM element where the SHLink widget will be rendered.
- `showDetails` (optional): A boolean flag indicating whether to display additional details about the SHLink. Defaults to `true`.

## Contributing

Contributions to the SMART Health Links Processing Library are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the library's GitHub repository.

## License

This library is released under the [MIT License](https://opensource.org/licenses/MIT).