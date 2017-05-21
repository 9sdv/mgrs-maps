<html>
	<head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    	<style type="text/css">
      		html { height: 100% }
      		body { height: 100%; margin: 0; padding: 0 }
      		#map_canvas { height: 100% }
      	</style>
      	<link rel="stylesheet" type="text/css" href="button.css" />
      	<link rel="stylesheet" type="text/css" href="infobox.css" />
      	<link rel="stylesheet" type="text/css" href="LocationBox.css" />

		<script type="text/javascript"
      		src="http://maps.googleapis.com/maps/api/js?key=AIzaSyCyA354yvl6jc-P9Snl3NlYmFbTdvE-nnc&sensor=false">
    	</script>
    	<script type="text/javascript" src="RoseGrid.js"></script>
    	<script type="text/javascript" src="MGRSGrid.js"></script>
    	<script type="text/javascript" src="MapIcon.js"></script>
    	<script type="text/javascript" src="Label.js"></script>

    	<script type="text/javascript">
    		this.gridLines = new google.maps.MVCArray()
    		this.gridLabels = new google.maps.MVCArray()
    		this.objects = new google.maps.MVCArray()
    		this.targets = new google.maps.MVCArray()
    		this.geometries = new google.maps.MVCArray()
    		this.routes = new google.maps.MVCArray()
			this.icons = new Array()
			<?php
				$dir = dir('img');
				while (($file = $dir->read()) !== false) {
					$ext = pathinfo($file, PATHINFO_EXTENSION);
					$basename = pathinfo($file, PATHINFO_FILENAME);
					if ($ext == "png") echo "this.icons['".$basename."'] = \"".$file."\"\n";
				}
				$dir->close();
			?>


    		function initalize() {
    			var myOptions = {
          			//center: new MGRSGrid("18T VP 50542 82608").locforGrid(),
          			//center: new MGRSGrid("18T WK 39949 28797").locforGrid(),
          			center: new MGRSGrid("56K KV 44844 84704").locforGrid(),
          			zoom: 12,
          			mapTypeId: google.maps.MapTypeId.HYBRID
        		}
        		this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions)
				google.maps.event.addListener(map, 'bounds_changed', function() { mapLoaded() })
				google.maps.event.addDomListener(this.map, 'click', function(event) { updateGrid(event) })
				readTargets()
				readPolylines()
				//readPolygons()
				//readPaas()
				loadIcons()
				// readEnemy()
				readLocations()
                // alert('Im here')
        	}


        	function mapLoaded() {
        		gridLines.forEach(function(item, index) {
  					item.setMap(null)
  				})

  				gridLabels.forEach(function(item, index) {
  					item.setMap(null)
  				})

        		var projection = this.map.getProjection()
  				var bounds = this.map.getBounds()
  				var ptCenter = projection.fromLatLngToPoint(this.map.getCenter())
  				var ptSouthWest = projection.fromLatLngToPoint(bounds.getSouthWest())
  				var ptWestCenter = new google.maps.Point(ptSouthWest.x, ptCenter.y)
  				var ptSouthCenter = new google.maps.Point(ptCenter.x, ptSouthWest.y)
  				var gridWestCenter = new MGRSGrid(projection.fromPointToLatLng(ptWestCenter))
  				var gridSouthCenter = new MGRSGrid(projection.fromPointToLatLng(ptSouthCenter))
				var gridCenter = new MGRSGrid(this.map.getCenter())

  				var dist = Array(parseFloat(gridCenter.distance(gridWestCenter)), parseFloat(gridCenter.distance(gridSouthCenter)) )
  				var datum = new MGRSGrid(gridCenter.toString())
  				var d1km = []

  				datum.translate(1000, 0)
  				d1km[1] = projection.fromLatLngToPoint(datum.locforGrid()).y - ptCenter.y
  				datum.translate(1000, 3200)
  				datum.translate(1000, 1600)
  				d1km[0] = projection.fromLatLngToPoint(datum.locforGrid()).x - ptCenter.x

  				var northingCorr = parseInt(gridCenter.northing().substring(2,5))
  				var eastingCorr = parseInt(gridCenter.easting().substring(2,5))

  				gridCenter.toGridSquare()
  				var grid1 = new MGRSGrid(gridCenter.toString())
  				var grid2 = new MGRSGrid(gridCenter.toString())
  				grid1.translate(dist[0]-eastingCorr, 4800)
  				grid2.translate(dist[0]+eastingCorr, 1600)

  				var pt1 = projection.fromLatLngToPoint(grid1.locforGrid())
  				var pt2 = projection.fromLatLngToPoint(grid2.locforGrid())
  				var pt3 = new google.maps.Point(pt1.x, pt1.y)
  				var pt4 = new google.maps.Point(pt2.x, pt2.y)

  				var path = Array(grid1.locforGrid(), grid2.locforGrid())
  				gridLine(path, true)


  				do{
  					pt1.y-=d1km[1]
  					pt2.y-=d1km[1]
  					gridLine(Array(projection.fromPointToLatLng(pt1), projection.fromPointToLatLng(pt2)), true)

  					pt3.y+=d1km[1]
  					pt4.y+=d1km[1]
  					gridLine(Array(projection.fromPointToLatLng(pt3), projection.fromPointToLatLng(pt4)), true)
  				} while (pt1.y<ptSouthWest.y)

  				grid1 = new MGRSGrid(gridCenter.toString())
  				grid2 = new MGRSGrid(gridCenter.toString())
  				grid1.translate(dist[1] + northingCorr, 0)
  				grid2.translate(dist[1]-northingCorr, 3200)
  				gridLine(Array(grid1.locforGrid(), grid2.locforGrid()), false)

  				pt1 = projection.fromLatLngToPoint(grid1.locforGrid())
  				pt2 = projection.fromLatLngToPoint(grid2.locforGrid())
  				pt3 = new google.maps.Point(pt1.x, pt1.y)
  				pt4 = new google.maps.Point(pt2.x, pt2.y)
  				gridLine(Array(grid1.locforGrid(), grid2.locforGrid()), false)
  				do{
  					pt1.x-=d1km[0]
  					pt2.x-=d1km[0]
  					gridLine(Array(projection.fromPointToLatLng(pt1), projection.fromPointToLatLng(pt2)), false)
  					pt3.x+=d1km[0]
  					pt4.x+=d1km[0]
  					gridLine( Array(projection.fromPointToLatLng(pt3), projection.fromPointToLatLng(pt4)), false)
  				} while(pt1.x>ptSouthWest.x)

        	}

        	function gridLine(path, northing) {
        		this.gridLines.push( new google.maps.Polyline({
    					path: path,
    					strokeColor: "#0F0",
    					strokeOpacity: 1.0,
    					strokeWeight: 1,
    					clickable: false,
    					map: this.map
  					}) )
  				var text = northing ?  Math.round(parseFloat((new MGRSGrid(path[0])).northing())/1000) :
  												Math.round(parseFloat((new MGRSGrid(path[0])).easting())/1000)

  				var offsetx = northing ? "300px" : "-5px"
  				var offsety = northing ? "-2px" : "-150px"
  				this.gridLabels.push(new Label( {
          			map: this.map,
          			position: northing ? path[0] : path[1],
          			text: text,
          			offsetx: offsetx,
          			offsety: offsety
          			}) )
           	}

        	function addItem() {
        		var location = document.getElementById("grid").value
        		var type = this.icons[document.getElementById("icons_box").value]
        		var enemy = false;
        		if (type == 'enemy.png') {
        			enemy = true;
        		}
        		this.objects.push( new MapIcon({
        			map: this.map,
        			iD: this.objects.getLength(),
        			position: new MGRSGrid(location ? location : this.map.getCenter()),
        			draggable: true,
        			image: 'img/'+this.icons[document.getElementById("icons_box").value],
        			enemy: enemy
        		}) )

        	}

        	function updateGrid(mEvent) {
        		var thisGrid = new MGRSGrid(mEvent.latLng)
        		document.getElementById("grid").value = thisGrid.getfGrid()
        		document.getElementById("latlon").value = mEvent.latLng.toUrlValue(4)

        		var objArray = this.objects.getArray()

        		for(obj in objArray)
        			if(objArray[obj].display == 'measure') {
        				var myGrid = new MGRSGrid(objArray[obj].marker.getPosition())
        				document.getElementById(objArray[obj].myID +'_info').innerHTML = "Distance: " + thisGrid.distance(myGrid) + '<br/>' +
        																				"Direction: " + myGrid.direction(thisGrid) 
        			}
        		var tarArray = this.targets.getArray()
        		for(tgt in tarArray)
        			if(tarArray[tgt].display == 'measure') {
        				var myGrid = new MGRSGrid(tarArray[tgt].marker.getPosition())
        				document.getElementById(tarArray[tgt].myID +'_info').innerHTML = "Distance: " + thisGrid.distance(myGrid) + '<br/>' +
        																				"Direction: " + myGrid.direction(thisGrid) 
        			}

        	}

        	function setLines() {
        		var geomArray = this.routes.getArray()
        		for (line in geomArray) geomArray[line].setEditable(!geomArray[line].getEditable())

        	}

        	//function readFile() {
        		// readPolylines()

				/*var filePath = 'UI/targets.txt'
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("GET",filePath,false);
				xmlhttp.send(null);
				var fileContent = xmlhttp.responseText;
				var fileArray = fileContent.split('\n')
				alert(fileArray[1])*/
        	//}

        	function readTargets() {
				var fileArray = readFile('UI/targets3.txt').split('\n')
				var newTgts = []

				// alert('start')
				for (target in fileArray) {
                    //alert(fileArray[target])
					var thistgt = fileArray[target].split(":")
					newTgts[thistgt[1]] = newTgts[thistgt[1]] ? newTgts[thistgt[1]] + " " + thistgt[0] : thistgt[0]
				}

				for (target in newTgts) {
					//alert(target)
					this.targets.push( new MapIcon({
        				map: this.map,
        				iD: newTgts[target],
        				position: new MGRSGrid(target),
        			 	draggable: false,
        			 	target: true
        			}) )

				}

				// alert('done')
        	}

        	function readEnemy() {
				var fileArray = readFile('UI/enemy2.txt').split("\n")
        		for(enLoc in fileArray) {
        			var enemy = fileArray[enLoc].split(":")
        			var info = enemy[0].split(" ")
        			var grid = new MGRSGrid(enemy[1])
        			if ((info[1] != "phase1")||(info[1] != 'phase2')){
        			this.objects.push( new MapIcon({
        				map: this.map,
        				iD: this.objects.getLength(),
        				position: grid,
        				draggable: true,
        				image: 'img/enemy.png',
        				enemy: true
        			}) )
        			}

				}
        	}



        	function readLocations() {
				var fileArray = readFile('UI/locations_updated.txt').split("\n")
        		for(paa in fileArray) {

        			var thisPaa = fileArray[paa].split(":")
        			var info = thisPaa[0].split(" ")
        			var grid = new MGRSGrid(thisPaa[1])

					this.objects.push( new MapIcon({
        				map: this.map,
        				iD: this.objects.getLength(),
        				position: grid,
        				draggable: true,
        				image: 'img/'+info[1]+'.png',
        				enemy: false,
        				label: info[0]
        			}) )

				}
        	}


        	function readPolylines() {

        		var fileArray = readFile('UI/fscms2.txt').split("\n\n")
        		for(line in fileArray) {
        			if (fileArray[line]!="") {
        			var thisline = fileArray[line].split(":")
        			var info = thisline[0].split(" ")
        			thisline[1] = thisline[1].replace(/\s*/, "")
        			var path = thisline[1].split("\n")
					for (grid in path) path[grid] = (new MGRSGrid(path[grid])).locforGrid()
					insertLine(path, info[1])
					}
        		}

        	}

        	function readPolygons() {
        		var fileArray = readFile('UI/polygon.txt').split("\n\n")
        		for(poly in fileArray) {
        			var thisPoly = fileArray[poly].split(":\n")
        			var info = thisPoly[0].split(" ")
        			thisPoly[1].replace(/\s*/,"")
        			var path = thisPoly[1].split("\n")
        			for (grid in path) path[grid] = (new MGRSGrid(path[grid])).locforGrid()
        			insertPoly(path, info)
        		}
        	}

        	function readPaas() {
        		var fileArray = readFile('UI/mtr_locations.txt').split("\n")
        		for(paa in fileArray) {
                    //alert(fileArray[paa])
        			var thisPaa = fileArray[paa].split(":")
        			var info = thisPaa[0].split(" ")
        			var grid = new MGRSGrid(thisPaa[1])

        			var temp = new MapIcon({
        				map: this.map,
        				iD: info[0],
        				position: grid,
        				image: thisPaa[3]
        			})
        			var paaCircle = new google.maps.Circle({
    					radius: parseInt(thisPaa[4]),
    					strokeColor: thisPaa[2],
    					strokeOpacity: 1.0,
    					fillOpacity: 0.2,
    					fillColor: thisPaa[2],
    					strokeWeight: 1,
    					map: this.map
  					});

  					paaCircle.bindTo('center', temp.marker, 'position')

  					var lbl = new Label( {
        				map: this.map,
          				text: info[0],
          				offsetx: '2px',
          				offsety: '-15px'
        			})

        			lbl.bindTo('position', temp.marker)

        			this.objects.push(temp)

        		}
        	}



        	function readFile(path) {
        		try {
        			var xmlhttp = new XMLHttpRequest();
        		} catch(e1) {
        			try {
        				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
        			} catch(e2) {
        				try {
        					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
        				} catch(e3) {
        					xmlhttp = false
        				}
        			}
        		}
        		if (!xmlhttp) return

				xmlhttp.open("GET",path,false);
				xmlhttp.send(null);
				return  xmlhttp.responseText;
        	}

        	function showLineInfo(line) {
        		//alert(line)
        		//alert(line.getEditable())
        	}

        	function insertLine(path, color) {
        		var newLine = new google.maps.Polyline({
    				path: path,
    				strokeColor: color,
    				strokeOpacity: 1.0,
    				strokeWeight: 3,
    				editable: false,
    				map: this.map,
    				iD: 'line_'+this.routes.length
  				})
				this.routes.push(newLine)

  				google.maps.event.addListener(newLine, 'click', function() {
  					var path = this.getPath().getArray()
  					var string = ""
  					for(grid in path) string += (new MGRSGrid(path[grid])).getfGrid() + "\n"
  					document.getElementById("displaybox").value = string
  				})
        	}

        	function insertPoly(path, info) {
        		var fill = info[2] == 'nofill' ? 0 : 0.1
        		var newLine = new google.maps.Polygon({
    				path: path,
    				strokeColor: info[1],
    				strokeOpacity: 1.0,
    				strokeWeight: 2,
    				editable: false,
    				fillColor: info[1],
    				fillOpacity: fill,
    				clickable: false,
    				map: this.map,
    				iD: info[1]
  				})
				this.geometries.push(newLine)

  				google.maps.event.addListener(newLine, 'click', function() {
  					var path = this.getPath().getArray()
  					var string = ""
  					for(grid in path) string += (new MGRSGrid(path[grid])).getfGrid() + "\n"
  					document.getElementById("displaybox").value = string
  				})
        	}

        	function addLine() {
        		var path = []
        		path.push(this.map.getCenter())
        		if (document.getElementById("grid").value != "")
        			var location = (new MGRSGrid(document.getElementById("grid").value)).locforGrid()
        		else {
        			var location = new MGRSGrid(this.map.getCenter())
        			location.translate(1000, 1600)
        			location = location.locforGrid()
        		}
        		path.push(location)

        		insertLine(path, '#FF0000')
        		setLines()
        	}



    		function measureClick(id) {
				var icon = locatebyID(id)
				icon.display = 'measure'
				icon.writeInfoBox()

			}


			function detailClick(id) {
				var icon = locatebyID(id)
				icon.display = 'details'
				icon.writeInfoBox()
			}

			function sendToGrid(id) {
				var thisIcon = locatebyID(id)
				thisIcon.sendToGrid(new MGRSGrid(document.getElementById(id+'_textBox').value))
			}

			function adjRange(id) {
				var thisIcon = locatebyID(id)
				thisIcon.adjRange(document.getElementById(id+'_rangeBox').value)
			}

			function locatebyID(id){
				var objArray = this.objects.getArray()
				for(obj in objArray) {
					if (objArray[obj].myID == id) return(objArray[obj])
				}
				var tarArray = this.targets.getArray()
				for (tgt in tarArray){
					if (tarArray[tgt].myID == id) return(tarArray[tgt])
				}
			}

			function loadIcons() {
				var iconsBox=document.getElementById("icons_box");

				for (iconText in this.icons) {

					var option=document.createElement("option");
					option.text=""+iconText

					try {
  				    // for IE earlier than version 8
  						iconsBox.add(option,iconsBox.options[null]);
  					} catch (e) {
  						iconsBox.add(option,null);
  					}
				}
			}

			function ajaxRequest() {
				try {
					var request = new XMLHttpRequest()
				} catch (e1) {
					try {
						request = new ActiveXObject("Msxml2.XMLHTTP")
					} catch (e2) {
						try {
							request = new ActiveXObject("Microsoft.XMLHTTP")
						} catch (e3) {
							request = false
						}
					}
				}
				return request

			}

			function writeLines() {

				var url = "saveFile.php"

				var geomArray = this.routes.getArray()
				params="lines="
        		for (line in geomArray) {
        			var path = geomArray[line].getPath()
        			var grids = ""
					for (var i = 0; i < path.getLength(); i++) {
						grid = new MGRSGrid(path.getAt(i))
						grids+=grid.toString()+", "
					}
					params += geomArray[line].iD+"="+grids+"&"
        		}


				request = new ajaxRequest()
				request.open("GET", url, true)
				request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
				request.send(params)
				request.onreadystatechange = function() {
				}

				alert("function complete")
			}

    	</script>


	</head>
	<body onload="initalize()">
		<div id="map_canvas" style="width:100%; height:100%"></div>

		<div id="form" style="width: 200px; height: 82px; position: fixed; top: 15px; left: 100px; background-color: lightgray">
			<label for="grid" class="form">Grid:</label><br/>
			<input type="text" id="grid" name="grid" style="width: 125px;float:left;"/>
			<input type="text" id="latlon" name="latlon" style="width: 125px;float:left;"/>
			<div class="button_small" style="float:left;margin-left:10px;">Go</div>
			<select name="icons" id="icons_box" style="width: 125px;"></select>
		</div>
		<div id="add_object" class = "button" onclick="addItem()" style="top: 105px;">Add</div>
		<div id="add_line" class = "button" onclick="addLine()" style="top: 137px;">Add Line</div>
		<div id="edit_lines" class = "button" onclick="setLines()" style="top: 169px">Edit Lines</div>
		<div id="write_lines" class = "button" onclick="writeLines()" style="top: 200px">Write Lines</div>

		<?php
		/*
			include 'LocationBox.php';
			$aBtry = array(
				"Total PAX" => "60",
				"Location" => "4670 8180",
				"Medical Support" => "g",
				"Water" => "g",
			);
			drawLocationBox('Area 8A - A Btry',100,400, $aBtry);

			$bBtry = array(
				"Total PAX" => "65",
				"Location" => "4760 8079",
				"AOF" => "UNK",
				"Medical Support" => "g",
				"Water" => "g",
			);
			drawLocationBox('Area 8B - B Btry',100,550, $bBtry);

			$HHBinfo = array(
				"Total PAX" => "56",
				"Location" => "5220 8434",
				"Medical Support" => "g",
				"Water" => "g",
			);
			drawLocationBox('Area 15C - HHB',100,250, $HHBinfo);

			$gBtry = array(
				"Total PAX" => "69",
				"Location" => "5190 8280",
				"Medical Support" => "g",
				"Water" => "g",
				"Fuel" => "UNK"
			);
			drawLocationBox('Area 10A - G Btry',100,700, $gBtry);

			$mates = array(
				"Total PAX" => "36",
				"Location" => "5260 8410",
				"Medical Support" => "",
				"Water" => "",
			);
			drawLocationBox('MATES',-50,100, $mates);

			$op4 = array(
				"Total PAX" => "6",
				"Location" => "5260 8410",
				"Medical Support" => "",
				"Water" => "",
			);
			drawLocationBox('OP4',-50,250, $op4);

			$op9 = array(
				"Total PAX" => "0",
				"Location" => "5300 8790",
				"Medical Support" => "",
				"Water" => "",
			);
			drawLocationBox('OP9',-50,400, $op9);

			*/
		 ?>

	</body>

</html>
