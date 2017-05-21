<?php
	include "data_manager.php";
	
	//$writer = new dbManager('maps_data');
	$file = fopen("UI/lines_write.txt", "w");
    fwrite($file,'test')
	foreach($_POST as $key=>$value) {
		$value = str_replace(", ", "\n", $value);
	    fwrite($file, "\n$key #00D: \n$value");
		//$writer->insert('polylines',$key,'color','#00D');
		//$writer->insert('polylines',$key,'grids',$value);
	}

	fwrite($file, "\n");
	fclose($file);
?>
