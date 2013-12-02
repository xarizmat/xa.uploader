/* 

jQuery File Uploader Plugin

This is a simple, light-weight, (HTML5 ONLY!!!) jquery uploader.
It has no ui, and a very simple interface so you can use
your imagination about your ui for this uploader. there
are events for every function.

Copyright (c) 2013 xarizmat tech (Leo Barsukov)

*/

(function ($) {
    $.xa = {
        uploader: function (obj) {
            //basic response reader (for json responses)
            var getJSON = function (str) {
                var s = null;
                try { s = $.parseJSON(str); } catch (ex)
                { s = this.responseText; } if (s == null) { s = str; }
                return s;
            };

            //create the uploader form with all components
            //create the form
            var form = $("<form/>", {
                'id': obj.name,
                'name': obj.name,
                'method': 'post',
                'enctype': 'multipart/form-data',
                'action': obj.url,
            });

            //apply style parameters (make it hidden)
            form.animate({ opacity: 0 }, 0);
            form.css('overflow', 'hidden');
            form.css('height', '0px');
            form.css('width', '0px');

            //create the input (inside our form)
            var uploader = $("<input/>", {
                'name': 'file-' + obj.name,
                'type': 'file',
                'accept': obj.accept,
            });
            if (obj.multiple == true) uploader.attr('multiple', '');

            //apply styling (make it hidden)
            uploader.animate({ opacity: 0 }, 0);
            uploader.css('height', '0px');
            uploader.css('width', '0px');
            uploader.css('overflow', 'hidden');

            //add uploader to html-body.
            form.append(uploader);
            $('body').append(form);

            var uploader_obj = {
                // base system methods
                /* these methods will be replaced
                 * when creating a new instance of an uploader.
                 */
                failed: function () { },
                progress: function () { },
                complete: function () { },
                cancelled: function () { },
                file_added: function () { },
                begin: function () { },

                // settings/parameters
                form: form,
                maxbytes: 6291456,
                upload_list: [],
                upload_max: 2,

                // internal parameters
                upload_count: 0,
                total: 0,
                up: 0,

                // function methods
                upload: function () {
                    $(form).find("input").get(0).click();
                },
                cancel: function () {
                    for (var i = 0; i < this.upload_list.length; i++) {
                        var item = this.upload_list[i];
                        if (item.status == 'complete') {
                            //do nothing here...
                        }
                        else {
                            item.status = 'cancelled';
                            try {
                                //abort upload (just in case)
                                if (item.xhr != null) item.xhr.abort();
                            } catch (ex) { }
                            this.cancelled(item);
                        }
                        this.up = 0;
                        this.total = 0;
                        this.upload_count = 0;
                    }
                },
                start_upload: function (file, nobj) {
                    /* create XMLHttpRequest */
                    var fd = new FormData();
                    fd.append(file.name, file.file);

                    var xhr = new XMLHttpRequest();
                    xhr.nobj = nobj;
                    xhr.file = file;
                    xhr.upload.parent = xhr;
                    file.xhr = xhr;
                    /*#################### EVENTS ##################### */
                    /* PROGRESS         : responds with upload progress */
                    xhr.upload.onprogress = function (p) {
                        var nobj = this.parent.nobj;
                        //let's count our progress//
                        if (nobj.up == null | nobj + '' == 'NaN') nobj.up = 0;
                        if (file.uploaded == null) file.uploaded = 0;
                        if (p.loaded > 0) { nobj.up += p.loaded - file.uploaded; }

                        file.uploaded = p.loaded;

                        var progress_total = nobj.up / nobj.total;
                        file.total_progress = (Math.round(progress_total * 10000) / 100);

                        var file_percent = file.uploaded / file.size;
                        file.progress = (Math.round(file_percent * 10000) / 100);

                        // this = null;
                        nobj.progress(file, {
                            event: p,
                            status: 'uploading',
                            xsr: this.parent,
                            data: this.parent.nobj,
                            loaded: p.loaded,
                            file: xhr.file,
                        }, this.parent.nobj);
                    };
                    /* REQUEST COMPLETE : responds when the operation is done */
                    xhr.onload = function (p) {
                        //this is either failed or completed... doesn't really matter.                        
                        switch (parseInt(this.status)) {
                            case (500):
                            case (404):
                            case (400):
                            case (413):
                            case (0): {
                                this.file.status = 'failed';
                                this.nobj.upload_count--;
                                file.uploaded = file.size;
                                nobj.failed(this.file,
                                    {
                                        event: p,
                                        status: this.status,
                                        xsr: this,
                                        data: this.nobj,
                                        file: this.file,
                                        response: getJSON(this.responseText)
                                    }, this.nobj);
                                break;
                            }
                            default: {
                                this.file.status = 'complete';
                                this.nobj.upload_count--;
                                file.uploaded = file.size;
                                nobj.complete(this.file,
                                    {
                                        event: p,
                                        status: this.status,
                                        xsr: this,
                                        data: this.nobj,
                                        file: this.file,
                                        response: getJSON(this.responseText)
                                    }, this.nobj);
                                break;
                            }
                        }
                        //$(this.nobj.form).find("input").get(0).value = null;
                    };
                    /* ERROR            : responds when upload failed */
                    xhr.onerror = function (p) {
                        nobj.failed({ event: p, status: this.status, xsr: this, data: null });
                    };
                    /* ABORT            : responds when upload is cancelled */
                    xhr.onabort = nobj.cancelled;
                    /* set xsr to post data */
                    xhr.open("POST", this.action);
                    /* start upload */
                    xhr.send(fd);
                    /* begin event: responds (NOW) when initial process is done. */
                    nobj.begin(nobj);
                },
                respond_dragleave: $.xa.uploader_timer({
                    interval: 10,
                    onexecute: function (params) {
                        params.t.dragleave(params.me);
                    }
                }),
                uploader_loop: function (r) {
                    //we will continue checking our list for new uploads//
                    setTimeout(function () { r.uploader_loop(r); }, 100);
                    var purgelist = [];
                    var done = true;

                    for (var i = 0; i < r.upload_list.length; i++) {
                        var item = r.upload_list[i];
                        if (r.loading != true) {
                            if (r.preview_ready != null) {
                                if (item.load_preview == 'yes') {
                                    r.loading = true;
                                    item.load_preview = 'loading';
                                    var reader = new FileReader();
                                    reader.onload = function (e) {
                                        r.preview_ready(item, e.target.result);
                                        item.load_preview = 'loaded';
                                        r.loading = false;
                                    };
                                    reader.readAsDataURL(item.file);
                                }
                            }
                        }

                        if (item.status == 'cancelled') purgelist.push(item);

                        if (r.upload_count < r.upload_max) {
                            if (item.status == 'pending') {
                                r.upload_count++;
                                item.status = 'uploading';
                                var fd = new FormData();
                                fd.append('uploadFile', item.file);
                                r.start_upload(item, r);
                                return;
                            }
                        }
                        if (item.status == 'pending' | item.status == 'uploading') done = false;
                    }
                    if (done) {
                        //no longer pending uploads. let's purge.
                        for (var i = 0; i < r.upload_list.length; i++) {
                            //this will purge our list//
                            r.upload_list.splice(0, 1);
                        }
                        if (r.up > 0) {
                            try {
                                r.complete(null, r);
                            } catch (ex) { }
                        }
                        r.up = 0;
                        r.total = 0;

                    }

                    if (purgelist.length > 0) {
                        r.complete(null, r);
                        for (var i = 0; i < purgelist.length; i++) {
                            var id = r.upload_list.indexOf(purgelist[i]);
                            r.upload_list.splice(id, 1);
                        }
                    }

                },
                init_drop: function (data) {
                    var pr = this;
                    var target = data.target;

                    var drop = {
                        parent: pr,
                        target: $(target).get(0),
                        dragover: function () { },
                        dragleave: function () { },
                        dragdrop: function () { },
                        init: function (me) {
                            var t = this;
                            t.uploader_unit = me;
                            t.target.ondragover = function (e) {
                                e.preventDefault();
                                t.dragover(me);
                                pr.respond_dragleave.stop();
                            };
                            t.target.ondragleave = function (e) {
                                e.preventDefault();
                                pr.respond_dragleave.delay(100, { t: t, me: me });
                            };
                            t.target.ondrop = function (e) {
                                var data = e.dataTransfer;

                                e.preventDefault();
                                e.stopPropagation();

                                t.dragdrop(me);
                                for (var i = 0; i < data.files.length; i++) {
                                    var out = data.files[i];
                                    if (out != null) {
                                        $.xa.push_file(out, pr);
                                    }
                                }

                            };
                        }
                    };
                    if (data.dragover != null) drop.dragover = data.dragover;
                    if (data.dragdrop != null) drop.dragdrop = data.dragdrop;
                    if (data.dragleave != null) drop.dragleave = data.dragleave;

                    drop.init(this);
                    return drop;
                }
            };

            //pass events from initializer;
            for (var prop in obj) if (obj[prop] != null) uploader_obj[prop] = obj[prop];

            /* link data model to [input=file] of the model */
            uploader.get(0).obj = uploader_obj;

            /* upload functions: respond to file select, upload, report events */
            uploader.get(0).onchange = function (tx) {
                /* create required variables */
                if (this.value == null) return;
                var nobj = this.obj;

                for (var i = 0; i < this.files.length; i++) {
                    //here, we will add all the files to our upload queue
                    var file = this.files[i];
                    //add our file to the list.
                    $.xa.push_file(file, nobj);
                }
                this.value = null;
            };
            uploader_obj.uploader_loop(uploader_obj);
            return uploader_obj;
        },
        //adds the file to a query list//
        push_file: function (file, nobj) {
            var status = 'pending';

            //let's manage our errors// (initial check)
            var too_large = file.size > nobj.maxbytes;
            var ext_pass = $.xa.extension_check(file.name, nobj.ext);
            var error = 'none';
            if (too_large | !ext_pass) status = 'error';
            if (too_large) error = 'file too large';
            if (!ext_pass) error = 'wrong extension';

            //let's update our upload size...
            nobj.progress.total_size += file.size;
            nobj.progress.file_count += 1;

            var file_data = {
                file: file,
                name: file.name,
                size: file.size,
                progress: 0,
                status: status,
                error: error,
                id: nobj.upload_list.length,
                uploader: nobj,
                preup: 0
            };
            if (status != 'error') nobj.total += file.size;
            //add our file to the upload list//
            nobj.upload_list.push(file_data);

            //push file add notification     //
            nobj.file_added(file_data, nobj);
        },
        //check file extension based on assigned filter
        //this works for both browse and drop
        extension_check: function (filename, ext) {
            if (ext == null) return true;
            var fail = true;
            var fname = filename.split('.');
            var fext = "." + fname[fname.length - 1].toLowerCase();
            var ext = ext.split(';');
            for (var i = 0; i < ext.length; i++) {
                var ex = "." + ext[i].toLowerCase();
                if (ex == fext) { fail = false; break; }
            }
            if (fail) return false; //extension check has passed
            return true;            //extension check has failed
        },
        uploader_timer: function (params) {
            var timer = {
                runat: 0,
                interval: 100,
                onexecute: function () { },
                params: null,
                running: false,
                stop: function () {
                    this.runat = 99999999999999999999;
                },
                delay: function (delay, params) {
                    if (delay == -1) {
                        runat = -1;
                    }
                    else {
                        var d = new Date().getTime();
                        this.runat = d + delay;
                        this.params = params;
                        if (!this.running) {
                            this.running = true;
                            this.execute();
                        }
                    }
                },
                execute: function () {
                    var t = this;
                    setTimeout(function () {
                        if (t.runat == -1) {
                            t.running = false;
                        }
                        else {
                            var d = new Date().getTime();
                            if (d > t.runat) {
                                t.onexecute(t.params);
                                t.running = false;
                            }
                            else {
                                t.execute();
                            }
                        }
                    }, t.interval);
                }
            }
            if (params.onexecute != null) timer.onexecute = params.onexecute;
            if (params.interval != null) timer.interval = params.interval;
            return timer;
        },

        //sub-functions

        load_params: function (params) {
            var default_params = {
                multiple: true,
                action: document.location,
                maxbytes: 20971520,//default to 20MB
                upload_max: 4
            };
        },
    };

    //jQuery implementation of the upload system
    //Create the uploader(based on parameters) and use the 
    //object as the browse button
    $.fn.uploader_browse = function (params) {
        var t = this.get(0);
        params.parent = $(t).parent();
        t.uploader_unit = $.xa.uploader(params);
        $(t).click(function () { t.uploader_unit.upload(); });
        return this;
    };
    //initialize drop functionality
    $.fn.uploader_drop = function (params) {
        var t = this.get(0);
        var uploader = t.uploader_unit;
        if (params.target == null) params.target = t;
        uploader.init_drop(params);
        return this;
    };
    $.fn.get_uploader = function () {
        return this.get(0).uploader_unit;
    };
}(jQuery));
