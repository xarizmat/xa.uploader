xa.uploader
===========

Live Demo <a href='http://csitb.com/demo/uploader' target='_blank'>here</a>

jQuery File Uploader with Drag-Drop


This is a two-part file uploader which allows you to upload files to any http server.

* requirements:
 * jQuery (should work with most versions)
 * xa.uploader.js (main uploader library)
 * xa.uploader_ui.js (only required for the UI uploader)


UI Uploader is easy to use.
===========================
```javascript

$('.uploader-container').uploader({
 action:'/upload-url',  //upload URL
 maxbytes:20971520,     //maximum file size
 
 /* Allowed Parameters  ***********************************************************
  * maxbytes:20971520,              //max upload size in bytes                    *
  * multiple:true,                  //multiple file upload                        *
  * upload_max:2,                   //maximum number of uploads at a time         *
  * accept:'image/*',               //specify the file types uploader browses for *
  * ext:'jpg;jpeg;png;gif;bmp', //filter extensions (works on drop and browse)*
  *********************************************************************************/
});

```

Usage
=====

 1.1: Simple Uploader (no ui, if you want to build your own)
      This automatically uses the given jQuery element as the
      browse button
 
```javascript
    // jQuery usage
    // browse button
    $('.upload-button').uploader_browse({
      action:'/upload/url',
      maxbytes:20971520,              //max upload size in bytes
      multiple:true,                  //multiple file upload
      upload_max:2,                   //maximum number of uploads at a time
      accept:'image/*',               //specify the file types uploader browses for
      ext:'jpg;jpeg;png;gif;bmp', //filter extensions (works on drop and browse)
      file_added:function(file_data,uploader){
        // fires when a file is added to the list.
      },
      progress:function(file_data,params){
        // fires when progress changes
      },
      complete:function(file_data,params){
        // fires when an item is done uploading.
        // file_data will be null when all files have uploaded
      },
      failed:function(file_data,params){
        // fires when an upload fails.
      },
      cancelled:function(file_data,params){
        // fires when upload is cancelled
      }
      
    }).uploader_drop({target:'body'}); // allow upload file-drop

```

 1.2: Same as above, but does not use a jQuery element
```javascript
    
    // Generic Usage
    var uploader = $.xa.uploader({
      // parameters, just the same as in jQuery sample
    });
    // call this event 
    // to browse for a file to upload
    uploader.upload(); 

```

