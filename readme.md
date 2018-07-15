# Parsony CLI
#### Command line tools for the Parsony Framework

## Installation
Will install globally. The CLI can be accessed via ``` $ parsony```
``` 
$ [sudo] npm i -g parsony-cli 
```


### Create new Parsony project
Installation will download [Parsony WebServices](https://github.com/epcphelan/parsony-services-starter) ```/WebServices``` and [Parsony WebStarter](https://github.com/epcphelan/parsony-react-starter) ```/WebApp```,
and install node packages.

You will be prompted to configure your database immediately. 
We recommend you do this, as well as install Redis so that tests can be run immediately.
``` 
$ mkdir <Project Name> 
$ cd <Project Name> 
$ parsony init
```

### Create Service

```
$ parsony +s

```

### Add Endpoint
If the service does not yet exist, will also create new service.

``` 
$ parsony +
```

### Create Model

``` 
$ parsony +m
```
## License
### The MIT License

Copyright (c) 2010-2018 Google, Inc. http://angularjs.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.