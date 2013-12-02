xa.uploader
===========

jQuery File Uploader with Drag-Drop


This is a two-part file uploader which allows you to upload files to any http server.

usage:

 1: Simple Uploader (no ui, if you want to build your own)
 
    // jQuery usage
    // browse button
    $('.upload-button').uploader_browse({
      action:'/upload/url',
      maxbytes:20971520,              //max upload size (20mb)
      multiple:true,                  //multiple file upload
      upload_max:2,                   //maximum number of uploads at a time
      accept:'image/*',               //specify the file types uploader browses for
      ext:'.jpg;.jpeg;.png;.gif;bmp', //filter extensions (works on drop and browse)
      file_added(file_data,uploader){
        //fires when a file is added to the list.
      },
      progress(file_data,params){
        //fires when progress changes
      },
      complete(file_data,params){
        //fires when an item is done uploading.
        //file_data will be null when all files have uploaded
      },
      failed(file_data,params){
        //fires when an upload fails.
      },
      cancelled(file_data,params){
        //fires when upload is cancelled
      }
      
    }).uploader_drop({target:'body'}); // allow upload file-drop
    
    
