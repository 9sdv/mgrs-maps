<?php

	function drawLocationBox($title, $x, $y, $info) {
		if ($x > 0) { 
			$positionx = 'left: '.$x.'px;';
		} else {
			$positionx = 'right: '.-1*$x.'px;';
		}
		
		if ($y > 0) { 
			$positiony = 'top: '.$y.'px;';
		} else {
			$positiony = 'bottom: '.-1*$y.'px;';
		}
		?>
		
		
		<div class="location-box" style="<?php print $positiony; ?><?php print $positionx; ?>">
			<div class="info-cell title"><div style="padding-left:5px;"><?php print $title; ?></div></div>
			
			<?php foreach ($info as $key=>$value) {
				$bg = '#FFF';	
					 
				if ($value == 'g') {
					$value = '';
					$bg = '#0A0';
				} else if ($value == 'y') {
					$value = '';
					$bg = '#AA0';
				} else if ($value == 'r') {
					$value = '';
					$bg = '#A00';
				}
				
				
				?>
				
				
				<div class="info-cell" style="background:<?php print $bg; ?>">
					&nbsp;
					<div class="col1"><?php print $key; ?></div>
					<div class="col2"><?php print $value; ?></div>
				</div>
			
			<?php } ?>
		</div>
	<?php }
?>