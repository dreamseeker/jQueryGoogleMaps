<?php

	/* ---------------------------------------------------------
	
		init Placemarks Array
	
	------------------------------------------------------------ */
	$format = NULL;
	$callback = NULL;
	$placemarks = array();
	
	// set Placemark Properties
	array_push($placemarks,
		//マーカーに関する情報・ここから
		array(
			'name' => '郡山市役所',
			'description' => '
				<img src="http://mw2.google.com/mw-panoramio/photos/thumbnail/25589455.jpg">
				〒963-8024<br>
				福島県郡山市朝日１丁目２３−７<br>
				024-924-2491<br>
				<a href="http://koriyama.fukushima.jp">koriyama.fukushima.jp‎</a>',
			'url' => 'http://koriyama.fukushima.jp',
			'lookat' => array(
				'latitude' => '37.400529',
				'longitude' => '140.359743'
			),
			'icon' => 'orangeDot'
		),
		//マーカーに関する情報・ここまで（最後のマーカーのみ、直前のカンマは不要。）
		array(
			'name' => '郡山市民文化センター',
			'description' => '
				<img src="http://mw2.google.com/mw-panoramio/photos/thumbnail/24671550.jpg">
				〒963-8878<br>
				福島県郡山市堤下町１−２<br>
				024-934-2288<br>
				<a href="http://bunka-manabi.or.jp‎">bunka-manabi.or.jp‎</a>',
			'lookat' => array(
				'latitude' => '37.392745',
				'longitude' => '140.378156'
			),
			'icon' => 'blueDot'
		),
		array(
			'name' => '郡山市中央図書館',
			'description' => '
				<img src="http://mw2.google.com/mw-panoramio/photos/thumbnail/34055024.jpg">
				〒963-8876<br>
				福島県郡山市麓山１丁目５−２５<br>
				024-923-6601<br>
				<a href="http://koriyama.fukushima.jp‎‎">koriyama.fukushima.jp‎</a>',
			'lookat' => array(
				'latitude' => '37.393830',
				'longitude' => '140.374302'
			),
			'icon' => 'greenDot'
		)
	);
	
	get_request_parameters();
	output_http_response();
	
		/* ---------------------------------------------------------
		
			Function
		
		------------------------------------------------------------ */
		// Get Request Parameters
		function get_request_parameters() {
			global $format, $callback;
			
			if (isset($_REQUEST['format'])) {
				$format = $_REQUEST['format'];
			}
			
			if (isset($_REQUEST['callback'])) {
				$callback = $_REQUEST['callback'];
			}
		}
		
		// Output Http-Response
		function output_http_response() {
			global $format, $callback;
			mb_http_output('UTF-8');
	
			if ($format == 'xml') {
				header('Content-type: text/xml');
				echo create_xml();
			} else if ($format == 'json') {
				header('Content-type: application/json; charset=utf-8');
				header('Last-Modified: '.gmdate( 'D, d M Y H:i:s' ).' GMT');
				header('pragma: no-cache');
				header("Cache-Control: no-cache, must-revalidate");
				header("Expires: Tue, 31 Mar 1981 05:00:00 GMT");
				if($callback) {
					echo $callback . '(' . create_json() . ');';
				}else {
					echo create_json();
				}
			} else {
				header('Content-type: text/xml');
				echo create_error();
			}
		}
		
			/* ---------------------------------------------------------
			
				Generate Response Data
			
			------------------------------------------------------------ */		
			// Response XML
			function create_xml() {
				global $placemarks;
				$dom = new DOMDocument('1.0', 'UTF-8');
				$dom->formatOutput = true;
				$placemarks_node = $dom->createElement('Placemarks');
				$dom->appendChild($placemarks_node);
				
				foreach ($placemarks as $val) {
					$placemark_node = $placemarks_node->appendChild($dom->createElement('Placemark'));
					foreach ($val as $k => $v) {
						if($k == 'lookat'){ $k = 'LookAt'; }
						$node = $placemark_node->appendChild($dom->createElement($k));
						
						if($k == 'description'){
							$node->appendChild($dom->createCDATASection($v));
						} else if($k == 'LookAt'){
							foreach ($v as $label => $point) {
								$sub_node = $node->appendChild($dom->createElement($label));
								$sub_node->appendChild($dom->createTextNode($point));
							}
						} else {
							$node->appendChild($dom->createTextNode($v));
						}
					}
				}
				
				return $dom->saveXML();
			}
			
			
			// Response JSON
			function create_json() {
				global $placemarks;
				$placemark = array();
				$num = 0;
				
				foreach ($placemarks as $v) {	
					$placemark['placemarks'][$num] = $v;
					$num ++;
				}
				
				return json_encode($placemark);
			}
			
			
			// Response ERROR
			function create_error() {
				$data = '<result></result>';
				$sxe = new SimpleXMLElement($data);
				$sxe->addChild('error', 'Sorry. This request is not supported format.');
				
				return $sxe->asXML();
			}
?>