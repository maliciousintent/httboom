![Boom](http://i.imgur.com/YlgyXmF.png)
### HTTP-friendly errors for connect (and express)

This library is made of the following components:

### 1. Error "classes"

- ```httboom.AppError``` for **application errors** (e.g.: invalid response from backends, db errors)
- ```httboom.UserError``` for **user errors** (e.g.: missing or invalid user inputs)

Both constructors accept the same parameters, here is an almost-complete example:

```javascript

app.use('/', function (req, res, next) {
   
   // ...
   
   try {
     var j = JSON.parse('{ im: "illegal" }');
   } catch (original_error) {
     next(new AppError(http_status_code, your_error_code, user_message, debug_message_for_logs, [original_error]));
   }
   
   // ...
   
}

```


### 2. Error-handling middleware

```javascript

// add, as the last middleware
app.use(httboom.middleware(logger, [additional_logger_fn]);
```

This connect / express middleware will handle errors passed via ```next(err)```,
insert as the last middleware, after any 404 handler.  
It will log the error message, the stack trace and optionally prints additional information
by using ```additionalLoggingFn``` (*you may want to print current logged user's details,...*).

**You should provide an ```error``` template to be rendered, see ```examples/```.**


The following logic will be applied when rendering an error response:

```coffeescript

if 'html' in req.headers.accept
  # renders an 'error' template
  
  if is_user_error and req.flash
    # uses flash middleware and redirects back
    req.flash 'error', err.message
    res.redirect referer
    
  else
    # renders an 'error' template
    res.render 'error', error_data
      
else if 'json' in req.headers.accept
    # renders json response
    res.json error_data;

else
    # text-only (e.g. for wget / curl)
    res.end(error_data.message + ' + ' + error_data.errlogid

```


## Examples

See ```examples/example.js``` for a working example (you'll need to set a ```LOGENTRIES_APIKEY``` env variable).


## License

Copyright © 2013 Simone Lusenti <simone@plasticpanda.com>, Plastic Panda

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
