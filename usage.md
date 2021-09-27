# Usage

### Encoding a text message inside a picture

```text
xphoto --encode -i cover.png -m "Hello World" -o encoded.png
```

### Encoding a file inside a picture

```text
xphoto --encode -i cover.png -f myfile.txt -o encoded.png
```

### Decoding data from a picture

```text
xphoto --decode -i encoded.png
```

### Optional parameters

#### Password

```text
xphoto --encode -i cover.png -m "Hello World" -o encoded.png --password mypassword
```

