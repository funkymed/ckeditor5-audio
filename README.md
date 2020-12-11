CKEditor 5 audio feature
========================================

[![npm version](https://badge.fury.io/js/%40funkymed%2Fckeditor5-audio.svg)](https://www.npmjs.com/package/@funkymed/ckeditor5-audio)

This package implements the audio feature for CKEditor 5. The feature is introduced in a granular form implemented by a couple of plugins.
It was strongly inspired from the ckeditor5-image package.

## Demo

- See `sample/app.js`

## Documentation

## Installation
Add this to your custom build or inside your project.

- With npm

`npm install --save-dev @funkymed/ckeditor5-audio`


-With yarn

`yarn add -D @funkymed/@funkymed/ckeditor5-audio    `
- Works pretty much just like Image upload.

## Plugins

#### audio Plugin
- Plugin to parse audios in the editor
- Mandatory for the other plugins audioRelated plugins

```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [audio],
        audio: {}
    } )

```

#### audioUpload Plugin
- Plugin to upload audio files via toolbar upload prompt or drag and drop functionalities
- Specify allowed media(mime) types. Default => `['mpeg', 'ogg']`
- Allow multiple file upload or not, Default => `true`
- Add the `audioUpload` toolbar option to access the file repository
- Must provide an `UploadAdapter`.
See [ckeditor5 documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/upload-adapter.html)
- The use of the audio plugin is mandatory for this plugin to work

```
function audioUploadAdapterPlugin( editor ) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new audioUploadAdapter(loader);
    };
}

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [audio, audioUpload],
        extraPlugins: [audioUploadAdapterPlugin],
        toolbar: ['audioUpload'],
        audio: {
            upload: {
                types: ['mpeg'],
                allowMultipleFiles: false,
            }
        }
    } )
```

#### audioToolbar Plugin
- Balloon toolbar for different audio plugin plugins
- See audioResizing and audioStyle sections for examples

#### audioResizing Plugin
- Plugin for resizing the audio in the editor
- Should work just like image resize. See the ck-editor 5 documentation for more examples.
```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [audio, audioToolbar, audioResize] or [audio, audioToolbar, audioResizeEditing, audioResizeHandles],
        audio: {
            resizeUnit: 'px'
            // Configure the available audio resize options.
            resizeOptions: [
                {
                    name: 'audioResize:original',
                    value: null,
                    label: 'Original',
                    icon: 'original'
                },
                {
                    name: 'audioResize:50',
                    value: 50,
                    label: '50',
                    icon: 'medium'
                },
                {
                    name: 'audioResize:75',
                    value: '75',
                    label: '75',
                    icon: 'large'
                }
            ],
            toolbar: [
                'audioResize',
                '|',
                'audioResize:50',
                'audioResize:75',
                'audioResize:original'
            ]
        },
    } )
```

#### audioStyle Plugin
- Plugin for styling the audio plugins.
- Should work just like image resize. See the ck-editor 5 documentation for more examples.
- Predefined styles are:
  - `full`
  - `side`
  - `alignLeft`
  - `alignCenter`
  - `alignRight`
```
ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [audio, audioToolbar, audioStyle]
        audio: {
            styles: [
                'alignLeft', 'alignCenter', 'alignRight'
            ],
            toolbar: ['audioStyle:alignLeft', 'audioStyle:alignCenter', 'audioStyle:alignRight']
        },
    } )
```



## License

Licensed under the terms of
[GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license,
please check the `LICENSE.md` file.
