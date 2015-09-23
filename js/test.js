$('.upload').uploader_browse({
	action: '/upload',
	maxbytes: 20971520,
	multiple: true,
	upload_max: 10,
	//ext:'*.js',
	file_added: function (file_data, uploader) {
		// fires when a file is added to the list.
		
		file_data.file.block = $("<div/>").html(('<b>File Added to queue</b> ' + file_data.file.name + "  - status: " + file_data.status + ", " + file_data.error));
		console.log(file_data);
		$(".log").append(file_data.file.block);
	},
	progress: function (file_data, params) {
		// fires when progress changes
		file_data.file.block.html('<b>Uploading </b> ' + file_data.file.name);
	},
	complete: function (file_data, params) {
		// fires when an item is done uploading.
		// file_data will be null when all files have uploaded
		file_data.file.block.html('<b>Successfuly uploaded </b> ' + file_data.file.name);
	},
	failed: function (file_data, params) {
		// fires when an upload fails.
		try {
			file_data.file.block.html('<b>Upload Failed</b> ' + file_data.file.name + ", error = " + file_data.xhr.status);
			
			console.warn(file_data);
		} catch (ex) {
			console.warn(params);
		}
	},
	cancelled: function (file_data, params) {
		console.log(file_data);
        // fires when upload is cancelled
	}
}).uploader_drop({ target: 'body' });