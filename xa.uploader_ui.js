/* 

jQuery File Uploader Plugin

This is a simple, light-weight, (HTML5 ONLY!!!) jquery uploader.
It has no ui, and a very simple interface so you can use
your imagination about your ui for this uploader. there
are events for every function.

Creates a UI for the uploader (xa.uploader.js)

usage:
$(".upload-box").uploader({action:'/upload/url'});

Copyright (c) 2013 xarizmat tech (Leo Barsukov)

*/
(function ($) {
	//configure your output text here//
	$.uploader_text = {
		'fail': 'Failed',
		'complete': 'Complete',
		'cancelled': 'Cancelled',
		'pending': 'Pending',
		'browse-button': 'Browse...',
		'cancel-button': 'Cancel Upload',
		'clear-button': 'Clear'
	};


	//let's build the UI for the uploader
	$.fn.uploader = function (params) {

		var base = $("<div/>", { 'class': 'upload-list' });
		//create some of our main control buttons
		// Browse Button
		var browse_button = $("<div/>", { 'class': 'button browse' });
		browse_button.html($.uploader_text['browse-button']);
		// Cancel Button
		var cancel_button = $("<div/>", { 'class': 'button cancel' });
		cancel_button.html($.uploader_text['cancel-button']);
		// Clear Button
		var clear_button = $("<div/>", { 'class': 'button clear' });
		clear_button.html($.uploader_text['clear-button']);
		// Total Progress (bar)
		var total_progress = $("<div/>", { 'class': 'progress global' });
		total_progress.append($("<div/>", { 'class': 'progress core' }));

		//build the items together//
		var control_bar = $("<div/>", { 'class': 'uploader control bar' });
		//put all the buttons into our control bar
		control_bar.append(browse_button);
		control_bar.append(cancel_button);
		control_bar.append(clear_button);
		control_bar.append(total_progress);
		
		//let's stick our uploader into the jQuery element
		$(this).append(control_bar);
		$(this).append(base);
		$(this).addClass('uploader');

		var lparams = {
			multiple: true,
			action: document.location, //default to the current url
			maxbytes: 20971520,//20MB max download size
			upload_max: 2,
		};  //let's make sure we merge our parameters to get the right settings in.
		for (var p in lparams) if (params[p] == null) params[p] = lparams[p];
		params.base = base;

		var uploader = browse_button.uploader_browse({
			multiple: params.multiple,
			action: params.action,
			maxbytes: params.maxbytes,
			base: params.base,
			upload_max: 2,
			accept: params.accept,
			ext: params.ext,
			progress_box: total_progress,
			file_added: function (file_data, uploader) {
				var size_type = "KB";
				var file_size = (file_data.size / 1024);
				if (file_size > 1024) {
					file_size = (file_size / 1024);
					size_type = " <mbs>MB</mbs>";
				}
				var fsize = Math.round(file_size * 100) / 100;
				
				var ul = uploader.base;
				var udata = $('<div />', { 'class': 'upload-item', });
				var block = $('<div/>', { 'class': 'data-block' });
				var name = $('<div/>', { 'class': 'block name' });
				name.html(file_data.name);
				var size = $('<div/>', { 'class': 'block size' });
				size.html(fsize + size_type);
				var stat = $('<div/>', { 'class': 'status' });
				stat.html(file_data.status + ' - ' + file_data.error);
				var prog = $('<div/>', { 'class': 'block progress' });
				prog.append($('<div/>', { 'class': 'core' }));
				file_data.progress_box = prog;
				file_data.status_box = stat;
				
				if (file_data.status != 'pending') {
					udata.addClass('done');
				}
				//build the block (name, size status)
				block.append(name);
				block.append(size);
				block.append(stat);
				//add block to item
				udata.append(block);
				//finish item
				udata.append(prog);
				ul.append(udata);

				file_data.item = udata;
			},
			progress: function (file_data, params) {
				var pb = file_data.progress_box;
				var pr = pb.find(".core");
				pr.css('width', (file_data.progress) + '%');
				var gprog = file_data.uploader.progress_box.find(".progress.core");
				gprog.css('width', file_data.total_progress + '%');
				
			},
			complete: function (file_data, params) {
				if (file_data == null) {//fires when all files have been uploaded 
					var gprog = params.parent.find(".progress.core");
					gprog.css('width', '0px');
				} else {//fires when a file has finished uploading
					file_data.status_box.html($.uploader_text['compelete']);
					file_data.status_box.css('color', 'green');
					file_data.progress_box.find(".core").css('width', '100%');
					file_data.item.addClass('done');

					setTimeout(function () {
						file_data.item.animate({ opacity: 0, height: 0 }, 1000, function () {
							$(this).remove();
						});
					}, 3000);
				}
			},
			failed: function (file_data, params) {
				file_data.item.addClass('done');
				file_data.status_box.html($.uploader_text['failed'] + ' ' + params.response);
			},
			cancelled: function (file_data) {
				if (file_data.status_box != null) {
					file_data.item.addClass('done');
					file_data.status_box.html($.uploader_text['cancelled']);
					setTimeout(function () {
						file_data.item.animate({ opacity: 0, height: 0 }, 1000, function () {
							$(this).remove();
						});
					}, 5000);
				}
			}

		}).uploader_drop({ target: 'body' }).get_uploader();

		cancel_button.get(0).uploader = uploader;
		clear_button.get(0).uploader = uploader;
		clear_button.get(0).unit = $(this);

		cancel_button.click(function () {
			this.uploader.cancel();
			var gprog = this.uploader.progress_box.find(".progress.core");
			gprog.css('width', '0px');
		});

		clear_button.click(function () {
			this.unit.find(".upload-item.done").animate({ height: 0, opacity: 0 }, 500,
				function () {
					$(this).remove();
				});
		});

		$('.uploader .button').mousedown(function () { $(this).addClass("pressed"); });
		$('.uploader .button').mouseout(function () { $(this).removeClass("pressed"); });
		$('.uploader .button').mouseup(function () { $(this).removeClass("pressed"); });


	};

})(jQuery)
