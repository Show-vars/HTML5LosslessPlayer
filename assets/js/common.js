$(function() {
	var params = {
		artist: $('#artist'),
		title: $('#title'),
		seekbar: $('#seek'),
		bufferbar: $("#buffer"),
		progressbar: $("#progress"),
		timer: $("#time"),
		playbtn: $("#play"),
		backwardbtn: $("#backward"),
		forwardbtn: $("#forward"),
		volumebar: $("#volume"),
		volume: $("#volumevalue"),
		debug: $(".debug .body PRE")
	};
	if (!window.Audio || !('mozWriteAudio' in new Audio()) && !window.AudioContext && !window.webkitAudioContext) $(".unsupported").show();
	
	var mplayer = new Musica(params);
	$.get( "http://iostd.ru/audioapi.php?c=tracks", function( data ) {
		for (var i = 0; i < data.result.length; i++) {
			console.log(data.result[i]);
			mplayer.playlist.add(data.result[i]);
		}
		mplayer.playlist.setRepeatMode(1);
		mplayer.playlist.shuffle();
		mplayer.open();
		mplayer.play();
		
		mplayer.debug(function(data) {
			$(".debug .body PRE").html(data);
		});
	});
	$(".debug .title").click(function(e){
		$(".debug .body").slideToggle();
	});
});