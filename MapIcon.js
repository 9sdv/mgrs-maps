function MapIcon(opt_options) {

	this.map = opt_options['map']	
	var mIcon = this
	this.display = "details"
	this.myID = opt_options['iD']
	positionLatLng = (opt_options['position'] ? opt_options['position'].locforGrid() : this.map.getCenter())
	//alert(opt_options['position'])
	if (opt_options['target']) {
		var iconSize = [25, 25]
		this.image = new google.maps.MarkerImage('img/tgt.png', null,
					null,
					new google.maps.Point(iconSize[0]/2, iconSize[1]/2),
					new google.maps.Size(iconSize[0], iconSize[1]));
	
	}
	
	
	if (opt_options['image'] != null) {
		var iconSize = [34, 20]
		this.image = new google.maps.MarkerImage(opt_options['image'], null,
					null,
					new google.maps.Point(iconSize[0]/2, iconSize[1]/2),
					new google.maps.Size(iconSize[0], iconSize[1]))
					
	}

	if (opt_options['enemy']) {
		var iconSize = [36, 30]
		this.image = new google.maps.MarkerImage(opt_options['image'], null,
					null,
					new google.maps.Point(iconSize[0]/2, iconSize[1]/2),
					new google.maps.Size(iconSize[0], iconSize[1]))
					
	}


	this.marker = new google.maps.Marker({
					position: positionLatLng,
					map: this.map,
					raiseOnDrag: false,
					draggable: opt_options['draggable'],
					icon: this.image
	})
	
	if (opt_options['target']) {
		var lbl = new Label( {
        	map: this.map,
          	text: this.myID,
          	offsetx: '2px',
          	offsety: '-15px'
        }) 
        
        lbl.bindTo('position', this.marker)
	} else if (opt_options['label']) {		
		var lbl = new Label( {
			map: this.map,
			text: opt_options['label'],
			offsetx: '17px',
			offsety: '-4px'
		})
		
		lbl.bindTo('position', this.marker)
	}
	
	var div = this.infoDiv = document.createElement("div")
	div.id = this.myID + "_infowindow" 
	//div.style.cssText = 'position: absolute; background-color:white; width: 200px; font-size: 14px;	font-family: Arial;	font-weight: bold;'
	
	writeInfoBox(this)

	this.infowindow = new google.maps.InfoWindow({
		content: div
	})
	
	google.maps.event.addListener(this.marker, 'click', function() { objClick(mIcon) } )
	google.maps.event.addListener(this.marker, 'position_changed', function() {writeInfoBox(mIcon)})
	
	function objClick(mIcon) {
		if (document.getElementById(mIcon.myID + '_infowindow') == null)
			mIcon.infowindow.open(mIcon.map, mIcon.marker)
		
		else
			mIcon.infowindow.close()
	}
	
	function objMoved(mIcon) {
		//writeInfoBox(mIcon)
		if (document.getElementById(mIcon.myID + '_infowindow') != null)
			mIcon.infowindow.open(mIcon.map, mIcon.maker)
		
		document.getElementById(mIcon.myID + '_text_box').value = (new MGRSGrid(mIcon.marker.getPosition())).getfGrid()
	}
	
	
	MapIcon.prototype.sendToGrid = function(grid) {
		this.marker.setPosition(grid.locforGrid())
	}
	
	MapIcon.prototype.adjRange = function(range) {
		if(!this.rangeRing) {
			this.rangeRing = new google.maps.Circle({
    				strokeColor: document.getElementById(this.myID + '_range_color').value,
    				strokeOpacity: 1.0,
    				strokeWeight: 1,
    				fillOpacity: 0.1,
    				clickable: false,
    				map: this.map
  			});
  			
  			this.rangeRing.bindTo('center', this.marker, 'position')
		}
		
		this.rangeRing.setRadius(parseInt(range))
		this.rangeRing.setOptions({
			fillColor: document.getElementById(this.myID + '_range_color').value,
			strokeColor: document.getElementById(this.myID + '_range_color').value
		})
	}
	
	MapIcon.prototype.writeInfoBox = function(){
		writeInfoBox(this)	
	}
	
	function writeInfoBox(mIcon) {
		var range = 0
		if (mIcon.rangeRing)
			range = mIcon.rangeRing.getRadius()
		if (mIcon.display == "details") {
		var html = ''+
			'<div id="info_nav">' +
				'<ul>'+
					'<li onclick=\'detailClick("' + mIcon.myID + '")\'>Details</li>' +
					'<li onclick=\'measureClick("' + mIcon.myID + '")\'>Measure</li>' +
				'</ul>' +
			'</div>'+
			'<div id="info_bodyContainer">' +
				'<div id=info_body>' +
					'<p>Name: ' + mIcon.myID +' </p>' +
					'<div>Grid: <input type="text" id="' + mIcon.myID + '_textBox" class="textBox" maxlength="20" size="15" name="textbox" value="' + (new MGRSGrid(mIcon.marker.getPosition())).getfGrid() + '"/></div>' +
					'<div class="button_small" id="' + this.myID + '_goto_button" )" onclick=\'sendToGrid("' + mIcon.myID + '")\'>Go</div>' +
					'<div>Range: <input type="text" id="' + mIcon.myID + '_rangeBox" class="textBox" maxlength="6" size="2" name="textbox" value="' + range + '"/> </div>'+
					'<div><select name="range_color" id="' + mIcon.myID + '_range_color">' +
						'<option value="blue">Blue</option>'+
						'<option value="red">Red</option>' +
						'<option value="green">Green</option>' +
						'<option value="yellow">Yellow</option>' +
					'</select></div>' +
					'<div class="button_small" id="' + this.myID + '_range_button" onclick=\'adjRange("' + mIcon.myID + '")\'>Go</div>' +
				'</div>' +
			'</div>'
		}
			else
				var html = ''+
					'<div id="info_nav">' +
					'<ul>'+
						'<li onclick=\'detailClick("' + mIcon.myID + '")\'>Details</li>' +
						'<li onclick=\'measureClick("' + mIcon.myID + '")\'>Measure</li>' +
					'</ul>' +
					'</div>' + 
					'<div id="' + mIcon.myID + '_info"></div>'
			
			mIcon.infoDiv.innerHTML = html
	
	}
}
