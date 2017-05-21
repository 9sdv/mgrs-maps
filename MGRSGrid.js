function MGRSGrid(str) {
	MGRSGrid.prototype.rose = new RoseGrid()
	
	str = typeof str == 'object' ? newConvGrid(str, this.rose) : str
	this.grid = str !=0? formatGrid(str) : ""
		
	
	MGRSGrid.prototype.toString = function() {
		return this.grid
	}
	
	MGRSGrid.prototype.getfGrid = function() {		
		var x = this.grid.length
		return this.mapsheet().substring(0, x-12) + " " + this.mapsheet().substring(x-12, x-10) + " " + this.easting() + " " + this.northing()
	}
	
	MGRSGrid.prototype.easting = function() {
      	return this.grid.substring(this.grid.length-10, this.grid.length-5)
    }
      	
    MGRSGrid.prototype.northing = function() {
      	return this.grid.substring(this.grid.length-5, this.grid.length)
    }
    
    MGRSGrid.prototype.mapsheet = function() {
      	return this.grid.substring(0, this.grid.length-10)
    }
    
    MGRSGrid.prototype.toGridSquare = function() {
    	this.grid = formatGrid(this.mapsheet() + " " + this.easting().substring(0, 2) + " " + this.northing().substring(0, 2))
    	
    }
    
    MGRSGrid.prototype.samesheet = function(grid2) {
    	return this.mapsheet() == grid2.mapsheet()
    }
    
    MGRSGrid.prototype.direction = function(grid2) {
    	var array2 = this.adjustGrid(grid2)
    	if (array2 == 0)
    		return this.directionLatLon(grid2)
    	var array1 = Array(parseFloat(this.easting()), parseFloat(this.northing()))
		var direction = Math.atan2(array2[0]-array1[0], array2[1]-array1[1])*3200/Math.PI
		direction = direction < 0 ? direction+6400 : direction
		
		return direction.toFixed(2)
    }
  
    MGRSGrid.prototype.distance = function(grid2) {
    	var array2 = this.adjustGrid(grid2) 
    	if (array2 == 0)
    		return this.distanceLatLon(grid2)
    	
    	var array1 = Array(parseFloat(this.easting()), parseFloat(this.northing()))
   		var distance =  Math.sqrt(Math.pow((array2[1]-array1[1]), 2) + Math.pow((array2[0] - array1[0]), 2) )
      	
      	return distance.toFixed(2)
    }
    
    MGRSGrid.prototype.translate = function(dist, dir) {
    	var array = Array(parseFloat(this.easting()), parseFloat(this.northing()))
    	array[0]+=dist*Math.sin(dir*Math.PI/3200)
    	array[1]+=dist*Math.cos(dir*Math.PI/3200)
    	
    	if ( (Math.abs(array[0]) >= 200000) || (Math.abs(array[1]) >= 200000) )
    		return this.eolLatLon(dist, dir)
    
    	var sheets = this.adjsheets()
    	var sheet = this.mapsheet()
    	if (array[0] >= 100000) {
    		array[0]-=100000
    		sheet = sheets[1]
    		this.grid = sheet+this.grid.substring(this.grid.length-10, this.grid.length)
    		sheets = this.adjsheets()
    	}
    	else if (array[0] < 0) {
    		array[0]+=100000
    		sheet = sheets[3]
    		this.grid = sheet+this.grid.substring(this.grid.length-10, this.grid.length)
    		sheets = this.adjsheets()
    	}
    
    	if (array[1] >= 100000) {
    		array[1]-=100000
    		sheet = sheets[0]
    		this.grid = sheet+this.grid.substring(this.grid.length-10, this.grid.length)
    		sheets = this.adjsheets()
    	}
    	else if (array[1] < 0) {
    		array[1]+=100000
    		sheet = sheets[2]
    		this.grid = sheet+this.grid.substring(this.grid.length-10, this.grid.length)
    		sheets = this.adjsheets()
    	}
    	
    	array[0] = array[0].toFixed(0)
    	array[1] = array[1].toFixed(0)
    	var zeros = "00000"
    	array[0] = zeros.substring(0, 5-array[0].length) + array[0]
    	array[1] = zeros.substring(0, 5-array[1].length) + array[1]
    	this.grid = this.mapsheet() + array[0] + array[1]   
    
    }
    
    
    
    MGRSGrid.prototype.isAdj = function(sheet2) {
    	var array = this.adjsheets()
    	for (sheet in array) {
    		if (sheet2.mapsheet() == array[sheet]) {
    			return true
    		}
    	}
    	
    	return false
    }
    
    MGRSGrid.prototype.adjsheets = function() {
    	var centerGrid = new MGRSGrid(this.mapsheet() + "5000050000") 
    	var adjsheets = Array(centerGrid.eolLatLon(51000, 0).mapsheet(), centerGrid.eolLatLon(51000, 1600).mapsheet(), centerGrid.eolLatLon(51000, 3200).mapsheet(), 
    			centerGrid.eolLatLon(51000, 4800).mapsheet(), centerGrid.eolLatLon(72110, 800).mapsheet(), centerGrid.eolLatLon(72110, 2400).mapsheet(), centerGrid.eolLatLon(72110, 4000).mapsheet(),
    			centerGrid.eolLatLon(72110, 5600).mapsheet())

		return adjsheets
    }

	MGRSGrid.prototype.adjustGrid = function(grid2) {
		if (grid2.mapsheet() == this.mapsheet()) 
			return Array(parseFloat(grid2.easting()), parseFloat(grid2.northing()) )
		
		var array = this.adjsheets()
		var i = 0
		while (array[i] != grid2.mapsheet()) {
			i++
			
			if (i > array.length) 
				return 0
			
		}
		var grid2Array = Array(parseFloat(grid2.easting()), parseFloat(grid2.northing()))
		switch(i) {
			case 0: grid2Array[1]+=100000;
				break;
			case 1: grid2Array[0]+=100000;
				break;
			case 2: grid2Array[1]-=100000;
				break;
			case 3: grid2Array[0]-=100000;
				break;
			case 4: grid2Array[0]+=100000; grid2Array[1]+=100000;
				break;
			case 5: grid2Array[0]+=100000; grid2Array[1]-=100000;
				break;
			case 6: grid2Array[0]-=100000; grid2Array[1]-=100000;
				break;
			case 7: grid2Array[0]-=100000; grid2Array[1]+=100000;
				break;
		}
		
		return grid2Array
	}

	MGRSGrid.prototype.eolLatLon = function(dist, bearing) {
		
		var utm = this.rose.mgrs2utm( this.getfGrid() )
		var latlon = this.rose.utm2latlon( utm )
    	//alert(latlon)
    	var rad_array = latlon.split(" ")
    	//var d = 100000
    	var r = 6371000
    	bearing *= Math.PI/3200
    	rad_array[0]*=Math.PI/180
    	rad_array[1]*=Math.PI/180
    	//alert(rad_array[0] + " " + rad_array[1])
    	var lat2 = Math.asin(Math.sin(rad_array[0])*Math.cos(dist/r) + Math.cos(rad_array[0])*Math.sin(dist/r)*Math.cos(bearing))
    	var lon2 = rad_array[1] + Math.atan2(Math.sin(bearing)*Math.sin(dist/r)*Math.cos(rad_array[0]), Math.cos(dist/r)-Math.sin(rad_array[0])*Math.sin(lat2))
    	
    	lat2*=180/Math.PI
    	lon2*=180/Math.PI
    	return new MGRSGrid(this.rose.utm2mgrs( this.rose.latlon2utm(lat2 + " " + lon2), lat2 ) )
    	
	} 

	MGRSGrid.prototype.distanceLatLon = function(grid2) { 		
      	var latlng1 = this.rose.utm2latlon( this.rose.mgrs2utm(this.getfGrid()) ).split(" ")
      	var latlng2 = this.rose.utm2latlon( this.rose.mgrs2utm(grid2.getfGrid()) ).split(" ")
      			
      			
      	var r = 6371000
      	var dlat = (latlng2[0] - latlng1[0])*Math.PI/180
      	var dlon = (latlng2[1] - latlng1[1])*Math.PI/180
      			
      	var lat1 = latlng1[0]*Math.PI/180
      	var lat2 = latlng2[0]*Math.PI/180
      	var a = Math.pow(Math.sin(dlat/2), 2)+Math.cos(lat1)*Math.cos(lat2)*Math.pow(Math.sin(dlon/2), 2)
      	var distance = r*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      		
      	return distance.toFixed(2)
    }
    
    MGRSGrid.prototype.directionLatLon = function(grid2) {
    	var latlng1 = this.rose.utm2latlon( this.rose.mgrs2utm(this.getfGrid()) ).split(" ")
      	var latlng2 = this.rose.utm2latlon( this.rose.mgrs2utm(grid2.getfGrid()) ).split(" ")
      	var dlat = (latlng2[0] - latlng1[0])*Math.PI/180
      	var dlon = (latlng2[1] - latlng1[1])*Math.PI/180
      	var lat1 = latlng1[0]*Math.PI/180
      	var lat2 = latlng2[0]*Math.PI/180		
    	
    	var y = Math.sin(dlon)*Math.cos(lat2)
    	var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dlon)
    	var brng = Math.atan2(y,x)
    	
    	brng*=3200/Math.PI
    	return brng < 0 ? (brng+=6400).toFixed(2) : brng.toFixed(2)
      	
    }
       	
	MGRSGrid.prototype.locforGrid = function() {
      		var latlon = this.rose.utm2latlon(this.rose.mgrs2utm(this.getfGrid()))
      		var array = latlon.split(" ")
      		var location = new google.maps.LatLng(parseFloat(array[0]), parseFloat(array[1]))
      		return location
      	}
      	
      MGRSGrid.prototype.gridforLoc = function(loc) {
      		var str = loc.toString().replace(/[^0-9\-\. ]/g, '')
      		var array = str.split(" ")
      		this.grid = formatGrid(this.rose.utm2mgrs(this.rose.latlon2utm(str), array[0]))
      		
      	}
}

function newConvGrid(loc, rose) {
      	var str = loc.toString().replace(/[^0-9\-\. ]/g, '')
      	var array = str.split(" ")
      	return rose.utm2mgrs(rose.latlon2utm(str), array[0])
}

function formatGrid(str) {
	//alert("format start")

	var zeros = "00000"
	str = (""+str).toUpperCase()
	//alert("format2")
	var strArr = str.split(/[^0-9 ]/)
	var nums = strArr[strArr.length-1]
	str = str.replace(nums, '')
	nums = nums.replace(/^\s+|\s+$/g,"")
	str = str.replace(/ /g, '')
	//alert("format3: " + nums)
	var numsArr = nums.split(" ")
	if (numsArr.length == 2) {
		numsArr[0]+=zeros.substr(0, 5-numsArr[0].length)
		numsArr[1]+=zeros.substr(0, 5-numsArr[1].length)
		
		return str+numsArr.join('')
	}
	//alert("_"+nums+"_")
	var x = nums.substr(0, nums.length/2)	
	var y = nums.replace(x, '')
	x+=zeros.substr(0, 5-x.length)
	y+=zeros.substr(0, 5-y.length)	
	return str+x+y
}
