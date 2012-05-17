/*
 * jQuery GoogleMaps Plugin
 *
 * Copyright (c) 2011 TORU KOKUBUN (http://d-s-b.jp/)
 * Licensed under MIT Lisence:
 * http://www.opensource.org/licenses/mit-license.php
 * http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
 *
 * Last Modified: 2012-05-17
 * version: 1.03
 *
 * This program checked the oparation on jQuery 1.7.x
 * 
 */

(function($){
	$.fn.GoogleMaps = function( options ) {
		var opts = $.extend( {}, $.fn.GoogleMaps.defaults, options );
		
		return this.each(function(){
			/* -------------------------------------------------------------------------
		
				Properties
				
			-------------------------------------------------------------------------- */
			var $self = this;
			var latlng;
			var mapOpts;
			var map_canvas;
			var markers = [];
			var singleMarkerMode = ( !opts.file ) ? true : false;
			var file = opts.file;
			var dataType = ( opts.data_type ) ? opts.data_type : 'xml';
			var infoWindowMode = ( opts.info_window == 1 || !singleMarkerMode ) ? true : false;
			var html = ( singleMarkerMode ) ? opts.info_content : '';
			var linkMode = ( opts.link_target ) ? true : false;
			var linkTarget = opts.link_target;
			var listMode = ( opts.list_target ) ? true : false;
			var listTarget = opts.list_target;
			var list_html;
			var iconType = ( opts.icon_type ) ? opts.icon_type : '';
			var icons = opts.icons;
			
			/* -------------------------------------------------------------------------
		
				Initialize
				
			-------------------------------------------------------------------------- */
			init();
			
				/* -------------------------------------------------------------------------
		
					Function
				
				-------------------------------------------------------------------------- */

				// initialize
				function init(){
					if( singleMarkerMode ) {
						GoogleMapsLoad();
					} else {
						if( dataType == 'xml' ){
							XMLAjaxLoad();
						} else if( dataType == 'json' ) {
							JSONPAjaxLoad();
						}
					}
				};
				
				// Google Maps Load
				function GoogleMapsLoad(){
					latlng = new google.maps.LatLng( opts.lat, opts.lng );
					
					mapOpts = {
						center: latlng,
						zoom: opts.zoom,
						mapTypeControl: opts.map_type_control,
						mapTypeId: opts.map_type_id
					}
					
					map_canvas = new google.maps.Map( $self, mapOpts );
					
					// Single Marker Mode
					if( singleMarkerMode ){ CreateMarker( map_canvas, latlng, iconType, html ); }
				};
				
				// Create Marker	
				function CreateMarker ( map_canvas, latlng, custom_icon, html, title, url, cnt ){
					var icon = ( custom_icon ) ? icons[ custom_icon ] : icons[ 'redDot' ];
					var linkurl = ( url ) ? url : '#';
					
					var markerImg = icon.markerImg;
					var markerSize = icon.markerSize;
					var markerOrigin = icon.markerOrigin;
					var markerAnchor = icon.markerAnchor;
					var markerScaleSize = icon.markerScaleSize;
					var markerIcon = new google.maps.MarkerImage( markerImg, markerSize, markerOrigin, markerAnchor, markerScaleSize );
					
					var shadowImg = icon.shadowImg;
					var shadowSize = icon.shadowSize;
					var shadowOrigin = icon.shadowOrigin;
					var shadowAnchor = icon.shadowAnchor;
					var shadowScaleSize = icon.shadowScaleSize;
					var shadowIcon = new google.maps.MarkerImage( shadowImg, shadowSize, shadowOrigin, shadowAnchor, shadowScaleSize );
					
					var markerOpts = {
						position: latlng,
						map: map_canvas,
						icon: markerIcon,
						shadow: shadowIcon
					}
					
					// Set Marker
					var marker = new google.maps.Marker( markerOpts );
					markers.push( marker );
					
					// Info Window Mode Event
					if( infoWindowMode ) {
						google.maps.event.addListener( marker, 'click', function() {
							map_canvas.setCenter( latlng );
							info.close();
							info.setContent( html );
							info.open( map_canvas, marker ); 
						});
					}
					
					// Link Mode
					if( linkMode ) {
						$( linkTarget + ':eq('+ cnt + '),' + linkTarget + ':eq('+ cnt + ').children()' ).click(function(){
							clickLinkElement( cnt );
							return false;
						});
					}
					
					// List Mode
					if( listMode ) {
						var list_html = '<li><a href="' + linkurl + '">' + title + '</a></li>';
						$( listTarget ).append( list_html );
						$( listTarget + ' li:eq('+ cnt + ')' ).click(function(){
							clickLinkElement( cnt );
							return false;
						});
					}
				}
				
					// Combination Trigger
					function clickLinkElement( cnt ){
						google.maps.event.trigger( markers[ cnt ], "click" );
					}
				
				// XML File Load
				function XMLAjaxLoad() {
					$.ajax({
						url: file,
						dataType: 'xml',
						cache: false,
						success: function( data ) {
							// Map Init
							GoogleMapsLoad();
							
							// For Bounds
							var bounds = new google.maps.LatLngBounds();
							
							// Loaded Data Setting
							$( "Placemark", data ).each(function(i){
								
								// Set Properties
								latlng = new google.maps.LatLng(
									parseFloat( $( this ).find( 'latitude' ).text() ),
									parseFloat( $( this ).find( 'longitude' ).text() )
								);
								var name = $( this ).find( 'name' ).text();
								var description = $( this ).find( 'description' ).text();
								var url = $( this ).find( 'url' ).text();
								var custom_icon = $( this ).find( 'icon' ).text();
								
								// Set Info Window HTML
								var html  = '<div class="' + opts.info_window_class + '">';
									html += '<h' + opts.info_window_heading_level + '>' + name + '</h' + opts.info_window_heading_level + '>';
									html += description;
									html += '</div>';
								
								// Create Marker
								CreateMarker( map_canvas, latlng, custom_icon, html, name, url, i );
								
								// Fit Baunds
								bounds.extend( latlng );
								map_canvas.fitBounds( bounds );
								map_canvas.setCenter( bounds.getCenter() );
							});
						}
					});
				}
				
				// JSONP File Load
				function JSONPAjaxLoad() {
					$.getJSON( file + "&callback=?", function( json ) {
						// Map Init
						GoogleMapsLoad();
						
						// For Bounds
						var bounds = new google.maps.LatLngBounds();
						
						// Loaded Data Setting
						$.each( json.placemarks, function(i){
							var $obj = json.placemarks[i];
							
							// Set Properties
							latlng = new google.maps.LatLng(
								parseFloat( $obj.lookat['latitude'] ),
								parseFloat( $obj.lookat["longitude"] )
							);
							var name = $obj.name;
							var description = $obj.description;
							var url = $obj.url;
							var custom_icon = $obj.icon;
							
							// Set Info Window HTML
							var html  = '<div class="' + opts.info_window_class + '">';
								html += '<h' + opts.info_window_heading_level + '>' + name + '</h' + opts.info_window_heading_level + '>';
								html += description;
								html += '</div>';
							
							// Create Marker
							CreateMarker( map_canvas, latlng, custom_icon, html, name, url, i );
							
							// Fit Baunds
							bounds.extend( latlng );
							map_canvas.fitBounds( bounds );
							map_canvas.setCenter( bounds.getCenter() );
						})
					});
				}
				
		});
		
	};

	var info = new google.maps.InfoWindow();
	
	/* -------------------------------------------------------------------------
	
		set default options
	
	-------------------------------------------------------------------------- */
	$.fn.GoogleMaps.defaults = {
		
		// POSITION / ZOOM LEVEL
		lat: 37.400529,
		lng: 140.359743,
		zoom: 15,
		
		// MAP TYPE
		map_type_control: false,
		map_type_id: google.maps.MapTypeId.ROADMAP,
		
		// PLACEMAKERS File PATH & Data Type
		file: null,
		data_type: null,
		
		// INFORMATION WINDOW
		info_window: 0,
		info_content: null,
		info_window_class: 'info-data',
		info_window_heading_level: 1,
		
		// LINK TARGET ELEMENT
		link_target: null,
		list_target: null,
		
		icon_type: null,
		
		// ICON / SHADOW IMG SETTING
		icons :{
			redDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/red-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			blueDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			greenDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/green-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			ltblueDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/ltblue-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			yellowDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/yellow-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			purpleDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/purple-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			pinkDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/pink-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			},
			orangeDot: {
				markerImg: 'http://maps.google.co.jp/mapfiles/ms/icons/orange-dot.png',
				markerSize: new google.maps.Size( 32, 32 ),
				markerOrigin: new google.maps.Point( 0, 0 ),
				markerAnchor: new google.maps.Point( 16, 32 ),
				markerScaleSize: new google.maps.Size( 32, 32 ),
				shadowImg: 'http://maps.google.co.jp/mapfiles/ms/icons/msmarker.shadow.png',
				shadowSize: new google.maps.Size( 59, 32 ),
				shadowOrigin: new google.maps.Point( 0, 0 ),
				shadowAnchor: new google.maps.Point( 16, 32 ),
				shadowScaleSize: new google.maps.Size( 59, 32 )
			}
		}
		
	};
	
})(jQuery);
