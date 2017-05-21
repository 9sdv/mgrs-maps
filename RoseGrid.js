function RoseGrid() {
	RoseGrid.prototype.k0 = 0.9996
	RoseGrid.prototype.a = 6378137
	RoseGrid.prototype.b = 6356752.3142
	
	RoseGrid.prototype.mgrs2utm = function(mgrs) {
		var mgrsArray = mgrs.split(" ")
		var latband = mgrsArray[0].substr(mgrsArray[0].length-1)

		var utmz = parseInt(mgrsArray[0].substr(0, mgrsArray[0].length-1))
		var zcm = -180+6*(utmz-1)+3
		var lat = 8*(this.number(latband)-2)-80
		
		var dg1 = this.number(mgrsArray[1].charAt(0))
		var dg2 = this.number(mgrsArray[1].charAt(1))
		var x; var y;
		
		switch(utmz%6) {
			case 0: x= dg1-20;	y= dg2-5;
				break;
			case 1: x= dg1-4; 	y= dg2-0;
				break;
			case 2: x= dg1-12; 	y= dg2-5;
				break;
			case 3: x= dg1-20; 	y= dg2-0;
				break;
			case 4: x= dg1-4; 	y= dg2-5;
				break;
			case 5: x= dg1-12; 	y= dg2-0;
				break;
		}
		
		easting = 500000+100000*x+parseFloat(mgrsArray[2])
		northing = 100000*y+parseFloat(mgrsArray[3])
		
		var hem = (lat >= 0) ? 'N' : 'S'
		var utm = utmz + " " + easting + " " + northing + " " + hem
		//alert("oi")
		var latlonArray = ( (this.utm2latlon(utm)).split(" ") )
		//alert ("utm: " + utm + "\n" + latlonArray[0] + " " + lat)
		//alert( latlonArray[0] > lat ? "yes" : "no")
		while (latlonArray[0] < lat) {
			//alert("oi")
			northing += 2000000
			utm = utmz + " " + easting + " " + northing + " " + hem
			latlonArray = ( (this.utm2latlon(utm)).split(" ") )
		}
		
		return utmz + " " + easting + " " + northing + " " + hem
	}
	
	RoseGrid.prototype.utm2latlon = function(utm) {
		var utmArray = utm.split(" ")
		var x = parseFloat(utmArray[1])
		var y = parseFloat(utmArray[2])
		utmArray[3] == 'S' ? y-=10000000 : 0
		var M = y/this.k0
		//alert("y: " + y)
		var esq = 1-Math.pow(this.b,2)/Math.pow(this.a,2)
		var mu = M/(this.a*(1-esq*(1/4 + esq*(3/64 + 5*esq/256))))
		//alert("M: " + M)
		//alert("mu: " + mu)
		var e1 = (1 - Math.sqrt(1-esq))/(1 + Math.sqrt(1-esq))
		var fp = mu + e1*(3/2 - 27*Math.pow(e1, 2)/32)*Math.sin(2*mu) + Math.pow(e1, 2)*(21/16 - 55*Math.pow(e1, 2)/32)*Math.sin(4*mu)
			fp += Math.pow(e1, 3)*(Math.sin(6*mu)*151/96 + e1*Math.sin(8*mu)*1097/512)
		//alert("fp: " + fp)
		var ep2 = esq/(1-esq)
		var c1 = ep2*Math.pow(Math.cos(fp), 2)
		var t1 = Math.pow(Math.tan(fp), 2)
		var r1 = this.a*(1-esq)/Math.pow(1-esq*Math.pow(Math.sin(fp), 2), 1.5)
		var n1 = this.a/Math.sqrt(1-esq*Math.pow(Math.sin(fp), 2))
		var d = (x-500000)/(n1*this.k0)

		var lat = fp - (n1*Math.tan(fp)/r1)*(Math.pow(d, 2)/2 - (5+3*t1+10*c1-4*Math.pow(c1, 2)-9*ep2)*Math.pow(d, 4)/24 + 
			(61+90*t1+298*c1+45*Math.pow(t1, 2)-3*Math.pow(c1, 2)-252*ep2)*Math.pow(d, 6)/720)

		var zcm = -180+6*(utmArray[0]-1)+3
		//alert("zone: " + zcm)
		var lon = d - (1+2*t1+c1)*Math.pow(d, 3)/6 + (5-2*c1+28*t1-3*Math.pow(c1, 2)+8*ep2+24*Math.pow(t1, 2))*Math.pow(d, 5)/120
			lon/=Math.cos(fp)
			lon = zcm + lon*180/Math.PI 
	
		//alert("lat: " + lat*180/Math.PI + "\n" + "long: " + lon)
		return  lat*180/Math.PI + " " + lon
	}
	
	RoseGrid.prototype.utm2mgrs = function(utm, lat) {
		
		var utmArray = utm.split(" ")
		var x = utmArray[1]
		var easting = x%100000
		x -= easting
		x = Math.floor(x/100000)
		x--
		
		var y = utmArray[2]
		y %= 2000000
		var northing = y%100000
		y -= northing
		y = Math.floor(y/100000)
		switch(utmArray[0]%6) {
			case 0: x+=16; y+=5;
				break;
			case 1: x+=0; y+=0;
				break;
			case 2: x+=8; y+=5;
				break;
			case 3: x+=16; y+=0;
				break;
			case 4: x+=0; y+=5;
				break;
			case 5: x+=8; y+=0;
				break;
		}
		
		y > 19 ? y%=20 : 0
		
		var latBand = Math.floor((lat-(-80))/8)+2		
		var zeros = "00000"
		easting=easting.toFixed(0)
		easting=zeros.substr(easting.length)+easting
		northing=northing.toFixed(0)
		northing=zeros.substr(northing.length)+northing
		return utmArray[0]+this.letter(latBand)+" "+this.letter(x)+this.letter(y)+" "+easting+" "+northing
		
	}
	
	RoseGrid.prototype.number = function(str) {
		var x = str.charCodeAt(0)
		x >= 79 ? x-- : 0
		x >= 73 ? x-- : 0
		x -= 65
		
		return x
	}
 
	RoseGrid.prototype.letter = function(x) {
		x = parseInt(x)
		x > 23 ? x %= 24 : 0
		
		x+=65
		x >= 73 ? x+=1 : 0
		x >= 79 ? x+=1 : 0
		return String.fromCharCode(x)
	}

	
	
	RoseGrid.prototype.latlon2utm = function(latlon, x) {
		var array = latlon.split(" ")
		var lat = parseFloat(array[0])
		var lon = parseFloat(array[1])
		var f = 1/298.2572236
		var esq = 1-Math.pow(this.b,2)/Math.pow(this.a,2)
		
		var phi = lat*Math.PI/180
		var nu = this.a/Math.sqrt(1-esq*Math.pow(Math.sin(phi), 2))
		var ep2 = esq/(1-esq)	
		var utmz = 1+Math.floor((lon+180)/6)
		var zcm = -180+6*(utmz-1)+3
		var p = (lon-zcm)*Math.PI/180
		
		var M = phi*(1-esq*(1/4 + esq*(3/64 + esq*5/264))) 
			M -= Math.sin(2*phi)*(esq*(3/8 + esq*(3/32 + esq*45/1024)))
			M += Math.sin(4*phi)*(Math.pow(esq, 2)*(15/256 + esq*45/1024))
			M -= Math.sin(6*phi)*(Math.pow(esq, 3)*(35/3072))
			M *= this.a
		
		var k4 = this.k0*nu*Math.cos(phi)
		var k5 = ( this.k0*nu*Math.pow(Math.cos(phi), 3)/6) * (1 - Math.pow(Math.tan(phi), 2) + 9*ep2*Math.pow(Math.cos(phi), 2) )
		var x = k4*p+k5*Math.pow(p, 3)+500000
		
		var pcosphisq = Math.pow(p*Math.cos(phi), 2)
		var tanphisq = Math.pow(Math.tan(phi), 2)
		var ep2cosphisq = ep2*Math.pow(Math.cos(phi), 2)
		var y = this.k0*(M + nu*Math.tan(phi)*(pcosphisq*(0.5+pcosphisq*((5-tanphisq+9*ep2cosphisq+4*Math.pow(ep2cosphisq, 2))/24 + 
			pcosphisq*(61-58*tanphisq+Math.pow(tanphisq, 2)+600*ep2cosphisq-330*ep2)/720))))
		var hem = 'S'
		y < 0 ? y+= 10000000 : hem = 'N' 
		
		return utmz + " " + x.toFixed(4) + " " + y.toFixed(4) + " " + hem
	}
	
	
}
